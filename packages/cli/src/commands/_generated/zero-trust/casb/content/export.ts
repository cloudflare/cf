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
		"dlp-profile-id": {
			kind: "parsed",
			brief: "Filter by DLP profile IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dlp-profile-information": {
			kind: "parsed",
			brief:
				'DLP profile metadata for the export. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"entries": [{...}], "id": string, "name": string}].',
			optional: true,
			parse: String,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by integration IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief: "Filter to view content flagged on or before this date.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief: "Filter to view content flagged on or after this date.",
			optional: true,
			parse: String,
		},
		orders: {
			kind: "parsed",
			brief:
				'Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"direction": "asc" | "desc", "name": string} & {"name": "asset_name" | "dlp_profile_count" | "integration_name" | ...more})].',
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief: "Search term to filter content.",
			optional: true,
			parse: String,
		},
		vendors: {
			kind: "parsed",
			brief: "Filter by vendor types.",
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
			brief: "Request body for creating content exports.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "export",
	describe: "Create a content export",
	usage:
		"$0 zero-trust casb content export\n\nCreates a CSV export for content and accepts optional filters in the payload.",
	...parameters,
	loader: () => import("./export.handler.js"),
});

export default command;
