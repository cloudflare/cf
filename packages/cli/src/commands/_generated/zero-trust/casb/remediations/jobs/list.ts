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
		cursor: {
			kind: "parsed",
			brief: "A cursor for pagination.",
			optional: true,
			parse: String,
		},
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
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		"min-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediations updated on or after the min updated datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"max-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediations updated on or before the max updated datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter to view remediations with the given status.",
			values: ["pending", "processing", "completed", "failed", "validating"],
			optional: true,
		},
		"triggered-by-actor": {
			kind: "parsed",
			brief:
				"Filter remediations by what kind of actor triggered them. Supports multiple comma-separated values.",
			variadic: true,
			optional: true,
			choices: ["user", "account_token"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by an integration ID",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "An optional param to sort the results by the given field.",
			values: [
				"created_at",
				"affliction_date",
				"integration_name",
				"status",
				"last_updated_at",
				"asset_name",
				"finding_type_name",
			],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
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
	describe: "List remediation jobs",
	usage:
		"$0 zero-trust casb remediations jobs list\n\nList all remediation jobs tied to a specific Cloudflare Account. Note that `cursor` and `page` are mutually exclusive.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
