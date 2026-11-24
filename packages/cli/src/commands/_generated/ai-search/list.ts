import operation from "../_operations/ai-search/list.js";
/**
 * list command
 * @generated from apis/overlays/ai-search.ts
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
	describe: "List AI Search instances.",
	usage: "$0 ai-search list\n\nLists all AI Search instances in the account.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number (1-indexed).",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief:
				"Filter instances whose id contains this string (case-insensitive).",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief:
				"Return only instances with this exact Search for Agents hostname (case-insensitive).",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief: "Field to order results by.",
			values: ["created_at"],
			optional: true,
		},
		"order-by-direction": {
			kind: "enum",
			brief: "Order direction.",
			values: ["asc", "desc"],
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
				command: "ai-search list",
				classification: {
					safeFlags: ["order-by", "order-by-direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					hostname: argv["hostname"],
					order_by: argv["order-by"],
					order_by_direction: argv["order-by-direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances`,
						pathParams: { namespace: String(argv["namespace"] ?? "") },
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
						namespace: argv["namespace"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
