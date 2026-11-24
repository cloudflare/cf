import operation from "../../_operations/browser-run/crawl/get.js";
/**
 * get command
 * @generated from apis/overlays/browser-run.ts
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
	command: "get <job-id>",
	describe: "Get crawl result.",
	usage:
		"$0 browser-run crawl get <job-id>\n\nReturns the result of a crawl job.",
	flags: {
		"cache-ttl": {
			kind: "parsed",
			brief: "Cache TTL default is 5s. Set to 0 to disable.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Filter by URL status.",
			values: [
				"queued",
				"errored",
				"completed",
				"disallowed",
				"skipped",
				"cancelled",
			],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief: "Cursor for pagination.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief: "Limit for pagination.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "job-id", brief: "Crawl job ID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run crawl get",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cacheTTL: argv["cache-ttl"],
					status: argv["status"],
					cursor: argv["cursor"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run crawl get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/crawl/${argv["job-id"] == null ? "<job-id>" : encodeURIComponent(String(argv["job-id"]))}`,
						pathParams: { "job-id": String(argv["job-id"] ?? "") },
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
						job_id: argv["job-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
