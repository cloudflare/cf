/**
 * list command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor for pagination. Use the cursor value from result_info of the previous response.",
			optional: true,
			parse: String,
		},
		"field-changed": {
			kind: "enum",
			brief: "Filter by the field that was changed.",
			values: ["status", "user_classification"],
			optional: true,
		},
		"changed-by": {
			kind: "parsed",
			brief: "Filter by the actor that made the change.",
			optional: true,
			parse: String,
		},
		since: {
			kind: "parsed",
			brief: "Filter entries changed at or after this timestamp (RFC 3339).",
			optional: true,
			parse: String,
		},
		before: {
			kind: "parsed",
			brief: "Filter entries changed before this timestamp (RFC 3339).",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief:
				"Sort order for results. Use 'asc' for oldest first or 'desc' for newest first.",
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Retrieves account or zone Audit Log",
	usage:
		"$0 security-insights audit-logs list\n\nLists audit log entries for all Security Center insights in the account or zone, showing changes to insight status and classification.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
