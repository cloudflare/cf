import operation from "../../../_operations/zero-trust/casb/finding-types/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "List all finding types",
	usage:
		"$0 zero-trust casb finding-types list\n\nList all available finding types with pagination support.",
	flags: {
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		vendors: {
			kind: "parsed",
			brief:
				"Filter finding types by vendor. Supports multiple comma-separated values. Each value may be either the vendor enum (GOOGLE_WORKSPACE) or the friendly name returned by the read routes (Google Workspace).",
			variadic: true,
			optional: true,
			choices: [
				"ANTHROPIC",
				"AWS",
				"BITBUCKET",
				"BOX",
				"CONFLUENCE",
				"DROPBOX",
				"GITHUB",
				"GOOGLE_CLOUD_PLATFORM",
				"GOOGLE_WORKSPACE",
				"JIRA",
				"MICROSOFT",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
				"ZOOM",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		types: {
			kind: "parsed",
			brief:
				"Filter finding types by category type. Supports multiple comma-separated, case-insensitive values.",
			variadic: true,
			optional: true,
			choices: ["Content", "Posture"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		origins: {
			kind: "parsed",
			brief:
				"Filter finding types by origin. Supports multiple comma-separated, case-insensitive values.",
			variadic: true,
			optional: true,
			choices: ["custom", "system"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		severities: {
			kind: "parsed",
			brief:
				"Filter finding types by severity. Supports multiple comma-separated, case-insensitive values.",
			variadic: true,
			optional: true,
			choices: ["critical", "high", "medium", "low"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		search: {
			kind: "parsed",
			brief:
				"Filter finding types by name or ID (case-insensitive substring match).",
			optional: true,
			parse: String,
		},
		quarantined: {
			kind: "boolean",
			brief:
				"When true, return only quarantined finding types; when false, return only non-quarantined finding types. Omit to return both.",
			optional: true,
		},
		"min-updated-at": {
			kind: "parsed",
			brief:
				"Return only finding types updated at or after this RFC 3339 timestamp (inclusive).",
			optional: true,
			parse: String,
		},
		"max-updated-at": {
			kind: "parsed",
			brief:
				"Return only finding types updated at or before this RFC 3339 timestamp (inclusive).",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief:
				"Field to sort by (case-insensitive). Defaults to 'created'.\nName and vendor sorting is case-insensitive; vendor uses friendly provider names.\nAscending order: type Content then Posture; origin custom then system;\nseverity Low, Medium, High, Critical.",
			values: [
				"created",
				"updated",
				"match_count",
				"name",
				"vendor",
				"type",
				"origin",
				"severity",
			],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort direction for the primary field. Defaults to 'desc'.\nTies are resolved by case-insensitive name, then ID, both ascending regardless of direction.",
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
				command: "zero-trust casb finding-types list",
				classification: {
					safeFlags: ["quarantined", "order", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					vendors: argv["vendors"],
					types: argv["types"],
					origins: argv["origins"],
					severities: argv["severities"],
					search: argv["search"],
					quarantined: argv["quarantined"],
					min_updated_at: argv["min-updated-at"],
					max_updated_at: argv["max-updated-at"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb finding-types list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/finding_types`,
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
