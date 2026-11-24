/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List RFIs",
	usage:
		"$0 cloudforce-one requests list\n\nRetrieves a paginated list of RFIs with filtering and sorting options.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
