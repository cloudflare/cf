import operation from "../../../_operations/o11y/agents/traces/list.js";
/**
 * list command
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
	command: "list",
	describe: "List Agent Traces",
	usage:
		"$0 o11y agents traces list\n\nLists Traces with Agent activity in the window, newest activity first, including work without a Conversation ID. The window defaults to the last 24 hours. Each summary covers the Trace's Agent spans (invoke_agent, chat, execute_tool): the Agents and Conversation IDs seen, duration, token usage, models, providers, and LLM call, tool call and error counts.",
	flags: {
		service: {
			kind: "parsed",
			brief:
				"Only include work in which an Agent of this Worker service took part.",
			optional: true,
			parse: String,
		},
		agent: {
			kind: "parsed",
			brief:
				"Only include work in which an Agent with this gen_ai.agent.name took part. With service, both must match the same Agent.",
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief:
				"Start of the search window, as Unix epoch milliseconds. Defaults to 24 hours before to. Clamped to the 7-day retention boundary; the effective value is in result_info.from.",
			optional: true,
			parse: Number,
		},
		to: {
			kind: "parsed",
			brief:
				"End of the search window, as Unix epoch milliseconds. Defaults to now.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum items to return per page. Defaults to 20.",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y agents traces list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					service: argv["service"],
					agent: argv["agent"],
					from: argv["from"],
					to: argv["to"],
					per_page: argv["per-page"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y agents traces list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/agents/traces`,
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
