import operation from "../../../_operations/o11y/agents/traces/events.js";
/**
 * events command
 * @generated from apis/overlays/o11y.ts
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
	command: "events <traceId>",
	describe: "List Agent Trace events",
	usage:
		"$0 o11y agents traces events <traceId>\n\nReturns a page of a Trace's Agent spans (invoke_agent, chat, execute_tool) and their events, newest first. Trace and span IDs are the same as in the Worker's trace, and each span's parentSpanId links it into the Agent tree. Searches the full 7-day retention unless from or to narrow it. Continue with result_info.cursors.after; one page may not hold the whole tree.",
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Optional. Narrows the search, which by default covers the full 7-day retention, so any retained Trace ID can be fetched without a window. Start as Unix epoch milliseconds; the effective value is in result_info.from.",
			optional: true,
			parse: Number,
		},
		to: {
			kind: "parsed",
			brief:
				"Optional. Narrows the search; end as Unix epoch milliseconds. Defaults to now.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum items to return per page. Defaults to 100.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from result_info.cursors.after in the previous response. Send it with the same filters; its window replaces from and to.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "trace-id",
			brief: "Trace ID: 32 hexadecimal characters, matched case-insensitively.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y agents traces events",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					from: argv["from"],
					to: argv["to"],
					per_page: argv["per-page"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y agents traces events",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/agents/traces/${argv["trace-id"] == null ? "<trace-id>" : encodeURIComponent(String(argv["trace-id"]))}/events`,
						pathParams: { "trace-id": String(argv["trace-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						traceId: argv["trace-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
