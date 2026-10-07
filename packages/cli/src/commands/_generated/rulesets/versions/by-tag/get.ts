import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 rulesets versions by-tag get <tag>\n\nFetches the rules of a managed account or zone ruleset version for a given tag."
		)
		.positional("tag", {
			type: "string",
			description: "The category of a rule.",
			demandOption: true,
		})
		.option("id", {
			type: "string",
			description: "The unique ID of the ruleset.",
			demandOption: true,
		})
		.option("ruleset-version", {
			type: "string",
			description: "The version of the ruleset.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}/versions/{ruleset_version}/by_tag/{rule_tag}">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <tag>",
	describe: "List an account or zone ruleset version's rules by tag",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rulesets versions by-tag get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf rulesets versions by-tag get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/versions/${argv["ruleset-version"] == null ? "<ruleset-version>" : encodeURIComponent(String(argv["ruleset-version"]))}/by_tag/${argv["tag"] == null ? "<tag>" : encodeURIComponent(String(argv["tag"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							tag: String(argv["tag"] ?? ""),
							"ruleset-version": String(argv["ruleset-version"] ?? ""),
							id: String(argv["id"] ?? ""),
							"account-or-zone-id": String(accountOrZoneId),
						},
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

				const result = await withProgress(`Loading`, async () =>
					client.rulesets.versions.byTag.get({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						id: argv["id"],
						ruleset_version: argv["ruleset-version"],
						tag: argv["tag"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
