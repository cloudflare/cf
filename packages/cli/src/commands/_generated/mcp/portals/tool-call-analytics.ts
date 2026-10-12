import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * tool-call-analytics command
 * @generated from apis/overlays/mcp.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 mcp portals tool-call-analytics <portal-id>\n\nReturns daily or monthly tool-call counts for a portal."
		)
		.positional("portal-id", {
			type: "string",
			description: "Portal ID",
			demandOption: true,
		})
		.option("granularity", {
			type: "string",
			description: "Granularity",
			choices: ["daily", "monthly"],
		})
		.option("aggregate", {
			type: "string",
			description: "Aggregate",
			choices: ["true", "false"],
		})
		.option("tz", { type: "string", description: "Tz" })
		.option("days", {
			type: "number",
			description:
				"Daily trailing-window size; defaults to 7 and is ignored for monthly",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"mcp-portals-api-portal-tool-call-timeseries">;
type Query = SdkQuery<"mcp-portals-api-portal-tool-call-timeseries">;

const typedBuilder = withArgTypes<
	{
		granularity: Query["granularity"];
		aggregate: Query["aggregate"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "tool-call-analytics <portal-id>",
	describe: "Per-portal MCP tool-call timeseries",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mcp portals tool-call-analytics",
				classification: {
					safeFlags: ["granularity", "aggregate", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					granularity: argv["granularity"],
					aggregate: argv["aggregate"],
					tz: argv["tz"],
					days: argv["days"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mcp portals tool-call-analytics",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/ai-controls/mcp/analytics/portals/${argv["portal-id"] == null ? "<portal-id>" : encodeURIComponent(String(argv["portal-id"]))}/tool-calls/timeseries`,
						pathParams: { "portal-id": String(argv["portal-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.mcp.portals.toolCallAnalytics({
						account_id: accountId,
						portal_id: argv["portal-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
