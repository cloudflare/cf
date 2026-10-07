import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/rulesets.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 rulesets versions delete <ruleset-version>\n\nDeletes an existing version of an account or zone ruleset."
		)
		.positional("ruleset-version", {
			type: "string",
			description: "The version of the ruleset.",
			demandOption: true,
		})
		.option("id", {
			type: "string",
			description: "The unique ID of the ruleset.",
			demandOption: true,
		})
		.option("validate-only", {
			type: "boolean",
			description:
				"Validates the request without persisting changes when set to `true`. Responses that normally return 200 return `result: null`; endpoints that normally return 204 continue to return 204.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:delete:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}/versions/{ruleset_version}">;
type Query =
	SdkQuery<"generated:delete:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}/versions/{ruleset_version}">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <ruleset-version>",
	describe: "Delete an account or zone ruleset version",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rulesets versions delete",
				classification: {
					safeFlags: ["validate-only", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					dry_run: argv["validate-only"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf rulesets versions delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/versions/${argv["ruleset-version"] == null ? "<ruleset-version>" : encodeURIComponent(String(argv["ruleset-version"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"ruleset-version": String(argv["ruleset-version"] ?? ""),
							id: String(argv["id"] ?? ""),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.rulesets.versions.delete({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						id: argv["id"],
						ruleset_version: argv["ruleset-version"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
