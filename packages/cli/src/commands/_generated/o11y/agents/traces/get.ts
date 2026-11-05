import operation from "../../../_operations/o11y/agents/traces/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
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
			"$0 o11y agents traces get <traceId>\n\nReturns the summary of one Trace containing named Agent activity, with the same fields as the Trace list. Searches the full 7-day retention unless from or to narrow it. List the Trace's events with /agents/traces/{traceId}/events."
		)
		.positional("trace-id", {
			type: "string",
			description:
				"Trace ID: 32 hexadecimal characters, matched case-insensitively.",
			demandOption: true,
		})
		.option("from", {
			type: "number",
			description:
				"Optional. Narrows the search, which by default covers the full 7-day retention, so any retained Trace ID can be fetched without a window. Start as Unix epoch milliseconds; the effective value is in result_info.from.",
		})
		.option("to", {
			type: "number",
			description:
				"Optional. Narrows the search; end as Unix epoch milliseconds. Defaults to now.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <traceId>",
	describe: "Get an Agent Trace",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y agents traces get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					from: argv["from"],
					to: argv["to"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y agents traces get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/agents/traces/${argv["trace-id"] == null ? "<trace-id>" : encodeURIComponent(String(argv["trace-id"]))}`,
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
};

export default command;
