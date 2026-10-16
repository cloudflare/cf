import operation from "../../../_operations/o11y/agents/sessions/runs.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * runs command
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
			"$0 o11y agents sessions runs <conversationId>\n\nLists the traces associated with a session, ordered by most recent activity. The service and agent parameters must identify an agent that participated in the conversation. Results include every authorized trace containing an agent invocation in that conversation during the requested time range."
		)
		.positional("conversation-id", {
			type: "string",
			description:
				"OpenTelemetry gen_ai.conversation.id value that identifies the session.",
			demandOption: true,
		})
		.option("service", {
			type: "string",
			description:
				"Worker service name associated with the participating agent.",
			demandOption: true,
		})
		.option("agent", {
			type: "string",
			description:
				"Agent name reported in gen_ai.agent.name. The request is limited to conversations in which this service and agent participated.",
			demandOption: true,
		})
		.option("from", {
			type: "number",
			description:
				"Start of the requested time range, as Unix epoch milliseconds. Values earlier than the 7-day retention boundary are clamped.",
			demandOption: true,
		})
		.option("to", {
			type: "number",
			description:
				"End of the requested time range, as Unix epoch milliseconds. Must be later than from.",
			demandOption: true,
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque cursor from result_info.cursors.after in the previous response.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Maximum number of items to return. Defaults to 20 and cannot exceed 100.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "runs <conversationId>",
	describe: "List Agent session runs",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y agents sessions runs",
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
					cursor: argv["cursor"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y agents sessions runs",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/agents/sessions/${argv["conversation-id"] == null ? "<conversation-id>" : encodeURIComponent(String(argv["conversation-id"]))}/runs`,
						pathParams: {
							"conversation-id": String(argv["conversation-id"] ?? ""),
						},
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
						conversationId: argv["conversation-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
