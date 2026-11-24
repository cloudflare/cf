/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		application: {
			kind: "parsed",
			brief:
				"Filter by application/vendor (e.g., GOOGLE_WORKSPACE, MICROSOFT_INTERNAL).",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		"dlp-enabled": {
			kind: "boolean",
			brief: "Filter by DLP enabled status (true/false).",
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Field to order results by.",
			values: ["application", "created", "name", "status"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"page-size": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search integrations by name or application.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter by integration status.",
			values: ["Healthy", "Initializing", "Offline", "Unhealthy"],
			optional: true,
		},
		"use-cases": {
			kind: "parsed",
			brief:
				"Filter by enabled use cases (e.g., casb, ces). Matches integrations enrolled in any of the specified values. Can be specified multiple times.",
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List integrations",
	usage:
		"$0 zero-trust casb integrations list\n\nReturns a paginated list of integrations for the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
