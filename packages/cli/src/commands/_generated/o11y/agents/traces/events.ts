import operation from "../../../_operations/o11y/agents/traces/events.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * events command
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
			"$0 o11y agents traces events <traceId>\n\nReturns a page of authorized canonical otel events for a Trace containing named Agent activity, using the existing events-query flow. Searches the full 7-day retention unless from or to narrow it. Events are ordered by event timestamp and ID, newest first. Continue with result_info.cursors.after; one page is not a complete span tree."
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
		.option("per-page", {
			type: "number",
			description: "Maximum items to return per page. Defaults to 100.",
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
	command: "events <traceId>",
	describe: "List Agent Trace events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y agents traces events",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
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
};

export default command;
