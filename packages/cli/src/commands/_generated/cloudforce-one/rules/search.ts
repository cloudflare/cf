import operation from "../../_operations/cloudforce-one/rules/search.js";
/**
 * search command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "search",
	describe: "Search rules",
	usage:
		"$0 cloudforce-one rules search\n\nSearch rules using hybrid, vector, keyword, or exact retrieval, backed by AI Search with a SQL fallback.",
	flags: {
		namespace: {
			kind: "parsed",
			brief:
				"Selects namespaces. Repeat the parameter to select multiple namespaces (for example, namespace=foo&namespace=bar).",
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief:
				"Selects paths with exact-match semantics. Omit the parameter to return rules from all paths. Pass an empty string (path=) to return only rules with an empty or uncategorized path. Pass a value (for example, path=yara) to match that exact path. Repeat the parameter (for example, path=yara&path=expr) to OR-match multiple paths with SQL `IN (...)` semantics. The `recursive` flag affects only customer-account namespace selection.",
			optional: true,
			parse: String,
		},
		recursive: {
			kind: "enum",
			brief:
				"For customer accounts, true enables descendant matching for namespaces. Paths always use exact matching.",
			values: ["true", "false"],
			optional: true,
		},
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		"is-public": {
			kind: "enum",
			brief: "Limits rules to the specified public visibility.",
			values: ["true", "false"],
			optional: true,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
		query: {
			kind: "parsed",
			brief: "Natural-language or keyword search query.",
			parse: String,
		},
		"search-mode": {
			kind: "enum",
			brief: "Retrieval strategy used for the query.",
			values: ["exact", "hybrid", "vector", "keyword"],
			optional: true,
		},
		language: {
			kind: "enum",
			brief: "Limits results to the specified rule language.",
			values: ["yara", "js"],
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
				command: "cloudforce-one rules search",
				classification: {
					safeFlags: [
						"recursive",
						"is-public",
						"search-mode",
						"language",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					namespace: argv["namespace"],
					path: argv["path"],
					recursive: argv["recursive"],
					search: argv["search"],
					is_public: argv["is-public"],
					limit: argv["limit"],
					offset: argv["offset"],
					query: argv["query"],
					mode: argv["search-mode"],
					language: argv["language"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules search",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/search`,
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
