import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/logs.ts
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
			"$0 logs datasets get <dataset-id>\n\nRetrieve a single Log Explorer dataset by ID for the account or zone."
		)
		.positional("dataset-id", {
			type: "string",
			description: "Log Explorer dataset ID.",
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
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/logs/explorer/datasets/{dataset_id}">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <dataset-id>",
	describe: "Get an account or zone dataset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logs datasets get",
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
						command: "cf logs datasets get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/logs/explorer/datasets/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							"dataset-id": String(argv["dataset-id"] ?? ""),
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
					client.logs.datasets.get({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						dataset_id: argv["dataset-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
