import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
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
			"$0 o11y agents sessions list\n\nList the Sessions of one Agent in one Worker service observed in the window, most recently active first. A Session groups the Traces containing an invocation of the Agent with the same gen_ai.conversation.id. Results describe observed activity in the window, not complete history."
		)
		.option("service", {
			type: "string",
			description: "Worker service that emitted the Agent invocations.",
			demandOption: true,
		})
		.option("agent", {
			type: "string",
			description:
				"Agent name reported by the invocations (gen_ai.agent.name).",
			demandOption: true,
		})
		.option("from", {
			type: "number",
			description:
				"Start of the window, as Unix epoch milliseconds. Clamped to the 7-day retention period.",
			demandOption: true,
		})
		.option("to", {
			type: "number",
			description:
				"End of the window, as Unix epoch milliseconds. Must be later than from.",
			demandOption: true,
		})
		.option("cursor", {
			type: "string",
			description: "Opaque cursor returned in result_info.cursors.after.",
		})
		.option("per-page", { type: "number", description: "Per page" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"agents.sessions.list">;
type Query = SdkQuery<"agents.sessions.list">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Agent sessions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y agents sessions list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
						command: "cf o11y agents sessions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/agents/sessions`,
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
					client.observability.agents.sessions.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
