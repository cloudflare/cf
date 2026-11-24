/**
 * export command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"integration-id": {
			kind: "parsed",
			brief: "Filter by multiple integration IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediation jobs updated on or before this datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediation jobs updated on or after this datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		orders: {
			kind: "parsed",
			brief:
				'Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"direction": "asc" | "desc", "name": "asset_name" | "finding_type_name" | "integration_name" | ...more}].',
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "Filter by remediation job status.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Filter specification for remediation jobs export.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "export",
	describe: "Create a remediation jobs export",
	usage:
		"$0 zero-trust casb remediations jobs export\n\nCreates a CSV export for remediation jobs and accepts optional filters in the payload.",
	...parameters,
	loader: () => import("./export.handler.js"),
});

export default command;
