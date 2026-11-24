import operation from "../../../_operations/cloudforce-one/threat-signals/feeds/list.js";
/**
 * list command
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
	command: "list",
	describe: "List Threat Signals feeds",
	usage:
		"$0 cloudforce-one threat-signals feeds list\n\nLists the account's Threat Signals feed subscriptions.",
	flags: {
		page: {
			kind: "parsed",
			brief: "1-based page number. Minimum 1; defaults to 1.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of feeds per page, from 1 to 100. Defaults to 20.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief:
				"Optional 1–100 alias for per_page. When provided, limit takes precedence.",
			optional: true,
			parse: Number,
		},
		sort: {
			kind: "parsed",
			brief:
				"Sort by created_at, title, category, or url. Prefix the field with - for descending order; defaults to -created_at.",
			optional: true,
			parse: String,
		},
		category: {
			kind: "parsed",
			brief:
				"Exact feed-category filter, up to 100 characters. Omit to include all categories.",
			optional: true,
			parse: String,
		},
		"source-type": {
			kind: "enum",
			brief:
				"Filter by curated or custom feed source. Omit to include both source types.",
			values: ["curated", "custom"],
			optional: true,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Filter by enabled state. Accepts true, false, 1, or 0; omit to include enabled and disabled feeds.",
			optional: true,
		},
		status: {
			kind: "parsed",
			brief:
				"Exact stored polling-status filter, such as active or error. Omit to include every status.",
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
				command: "cloudforce-one threat-signals feeds list",
				classification: {
					safeFlags: ["source-type", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					limit: argv["limit"],
					sort: argv["sort"],
					category: argv["category"],
					source_type: argv["source-type"],
					enabled: argv["enabled"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals feeds list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/feeds`,
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
