import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/connector-telemetry-events.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 connector-telemetry-events list\n\nLists Magic WAN Connector Telemetry Events"
		)
		.option("connector-id", {
			type: "string",
			description: "Connector ID",
			demandOption: true,
		})
		.option("from", { type: "number", description: "From", demandOption: true })
		.option("to", { type: "number", description: "To", demandOption: true })
		.option("limit", { type: "number", description: "Limit" })
		.option("cursor", { type: "string", description: "Cursor" })
		.option("kind", { type: "string", description: "Filter by event kind" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"mconn-connector-telemetry-events-list">;
type Query = SdkQuery<"mconn-connector-telemetry-events-list">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "connector-telemetry-events list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					from: argv["from"],
					to: argv["to"],
					limit: argv["limit"],
					cursor: argv["cursor"],
					k: argv["kind"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf connector-telemetry-events list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}/telemetry/events`,
						pathParams: { "connector-id": String(argv["connector-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.connectorTelemetryEvents.list({
						account_id: accountId,
						connector_id: argv["connector-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
