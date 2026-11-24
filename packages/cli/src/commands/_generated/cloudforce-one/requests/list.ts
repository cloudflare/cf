import operation from "../../_operations/cloudforce-one/requests/list.js";
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
	describe: "List RFIs",
	usage:
		"$0 cloudforce-one requests list\n\nRetrieves a paginated list of RFIs with filtering and sorting options.",
	flags: {
		"project-type": {
			kind: "parsed",
			brief: "RFI project type",
			parse: String,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"page-size": {
			kind: "parsed",
			brief: "PageSize",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "parsed",
			brief:
				"Status filter. Projects with a narrowed dashboard vocabulary accept only their customer-facing values.",
			optional: true,
			parse: String,
		},
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		"created-by": {
			kind: "parsed",
			brief:
				"Filter by creator email. NOTE: For the `legal-response` project type this query parameter is **rejected with HTTP 400** — the server derives the filter from the authenticated user's JWT automatically and does not accept a client-supplied value. Requests to `legal-response` with no valid JWT identity are rejected with HTTP 401.",
			optional: true,
			parse: String,
		},
		assignee: {
			kind: "parsed",
			brief: "Assignee",
			optional: true,
			parse: String,
		},
		"request-type": {
			kind: "parsed",
			brief: "RequestType",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief: "Priority",
			optional: true,
			parse: String,
		},
		tlp: { kind: "parsed", brief: "Tlp", optional: true, parse: String },
		id: { kind: "parsed", brief: "ID", optional: true, parse: String },
		"readable-id": {
			kind: "parsed",
			brief: "ReadableId",
			optional: true,
			parse: String,
		},
		summary: {
			kind: "parsed",
			brief: "Summary",
			optional: true,
			parse: String,
		},
		"filter-account-id": {
			kind: "parsed",
			brief: "AccountId",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'JSON string object of metadata filters. Supports two formats: 1) Simple values for exact match (backward compatible): {"status": "open"} 2) Operator objects for advanced filtering: {"identifiers": {"operator": "contains_line", "value": "blah.com"}}. Available operators: \'eq\' (exact match, default), \'contains\' (substring match), \'contains_line\' (match complete line in newline-separated text). Date fields are automatically normalized to YYYY-MM-DD format.',
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "parsed",
			brief:
				"Sort field. SOC Communications support customer-safe latest_activity ordering.",
			optional: true,
			parse: String,
		},
		order: { kind: "parsed", brief: "Order", optional: true, parse: String },
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
				command: "cloudforce-one requests list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					pageSize: argv["page-size"],
					status: argv["status"],
					search: argv["search"],
					createdBy: argv["created-by"],
					assignee: argv["assignee"],
					requestType: argv["request-type"],
					priority: argv["priority"],
					tlp: argv["tlp"],
					id: argv["id"],
					readableId: argv["readable-id"],
					summary: argv["summary"],
					accountId: argv["filter-account-id"],
					metadata: argv["metadata"],
					orderBy: argv["order-by"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}`,
						pathParams: { "project-type": String(argv["project-type"] ?? "") },
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
						project_type: argv["project-type"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
