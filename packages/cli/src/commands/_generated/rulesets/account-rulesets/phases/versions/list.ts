import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * list command
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
			"$0 rulesets account-rulesets phases versions list\n\nFetches the versions of an account or zone entry point ruleset."
		)
		.option("ruleset-phase", {
			type: "string",
			description: "The phase of the ruleset.",
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
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/rulesets/phases/{ruleset_phase}/entrypoint/versions">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List an account or zone entry point ruleset's versions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rulesets account-rulesets phases versions list",
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
						command: "cf rulesets account-rulesets phases versions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets/phases/${argv["ruleset-phase"] == null ? "<ruleset-phase>" : encodeURIComponent(String(argv["ruleset-phase"]))}/entrypoint/versions`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"ruleset-phase": String(argv["ruleset-phase"] ?? ""),
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
					client.rulesets.accountRulesets.phases.versions.list({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						ruleset_phase: argv["ruleset-phase"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
