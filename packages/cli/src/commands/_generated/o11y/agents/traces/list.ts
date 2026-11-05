import operation from "../../../_operations/o11y/agents/traces/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/o11y.ts
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
			"$0 o11y agents traces list\n\nLists Traces with a named Agent invocation in the window, ordered by lastActivityMs, newest first, including work without a Conversation ID. The window defaults to the last 24 hours. Summaries include the Agent names and Conversation IDs seen, authorized Trace duration, chat input/output/total tokens, models, providers, LLM/tool call counts and span-error counts within the effective window."
		)
		.option("service", {
			type: "string",
			description:
				"Only include work in which an Agent of this Worker service took part.",
		})
		.option("agent", {
			type: "string",
			description:
				"Only include work in which an Agent with this gen_ai.agent.name took part. With service, both must match the same Agent.",
		})
		.option("from", {
			type: "number",
			description:
				"Start of the search window, as Unix epoch milliseconds. Defaults to 24 hours before to. Clamped to the 7-day retention boundary; the effective value is in result_info.from.",
		})
		.option("to", {
			type: "number",
			description:
				"End of the search window, as Unix epoch milliseconds. Defaults to now.",
		})
		.option("per-page", {
			type: "number",
			description: "Maximum items to return per page. Defaults to 20.",
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque cursor from result_info.cursors.after in the previous response. Send it with the same filters; its window replaces from and to.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Agent Traces",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y agents traces list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
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
};

export default command;
