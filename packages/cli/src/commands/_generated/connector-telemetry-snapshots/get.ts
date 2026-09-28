import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/connector-telemetry-snapshots.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 connector-telemetry-snapshots get <snapshot-t>\n\nGets Magic WAN Connector Telemetry Snapshot"
		)
		.positional("snapshot-t", {
			type: "string",
			description: "Snapshot t",
			demandOption: true,
		})
		.option("connector-id", {
			type: "string",
			description: "Connector ID",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"mconn-connector-telemetry-snapshots-get">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <snapshot-t>",
	describe: "Get Snapshot",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "connector-telemetry-snapshots get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf connector-telemetry-snapshots get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}/telemetry/snapshots/${argv["snapshot-t"] == null ? "<snapshot-t>" : encodeURIComponent(String(argv["snapshot-t"]))}`,
						pathParams: {
							"connector-id": String(argv["connector-id"] ?? ""),
							"snapshot-t": String(argv["snapshot-t"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.connectorTelemetrySnapshots.get({
						account_id: accountId,
						connector_id: argv["connector-id"],
						snapshot_t: argv["snapshot-t"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
