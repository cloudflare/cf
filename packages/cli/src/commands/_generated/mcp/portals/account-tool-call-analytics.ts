import operation from "../../_operations/mcp/portals/account-tool-call-analytics.js";
/**
 * account-tool-call-analytics command
 * @generated from apis/overlays/mcp.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "account-tool-call-analytics",
	describe: "Account-global MCP tool-call timeseries",
	usage:
		"$0 mcp portals account-tool-call-analytics\n\nReturns daily or monthly tool-call counts across the account.",
	flags: {
		granularity: {
			kind: "enum",
			brief: "Granularity",
			values: ["daily", "monthly"],
			optional: true,
		},
		aggregate: {
			kind: "enum",
			brief: "Aggregate",
			values: ["true", "false"],
			optional: true,
		},
		tz: { kind: "parsed", brief: "Tz", optional: true, parse: String },
		days: {
			kind: "parsed",
			brief:
				"Daily trailing-window size; defaults to 7 and is ignored for monthly",
			optional: true,
			parse: Number,
		},
		"response-status": {
			kind: "enum",
			brief: "Response status to count; 'all' counts every status",
			values: ["success", "error", "cached", "all"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mcp portals account-tool-call-analytics",
				classification: {
					safeFlags: ["granularity", "aggregate", "response-status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					granularity: argv["granularity"],
					aggregate: argv["aggregate"],
					tz: argv["tz"],
					days: argv["days"],
					response_status: argv["response-status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mcp portals account-tool-call-analytics",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/ai-controls/mcp/analytics/tool-calls/timeseries`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
