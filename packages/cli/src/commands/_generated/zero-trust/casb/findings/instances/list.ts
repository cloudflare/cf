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
		"finding-id": {
			kind: "parsed",
			brief:
				"The `id` of a finding, as returned in each item of the List posture findings response.\nIt is a base64-encoded identifier.",
			parse: String,
		},
		archived: { kind: "boolean", brief: "Archived", optional: true },
		cursor: {
			kind: "parsed",
			brief:
				"A cursor for pagination. Obtained from the `result_info.cursor` field of a previous response.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief:
				"Which field to use when ordering the Finding's instances.\nWhen ordering by 'remediation.status', only the most recent non-stale remediation job is considered. Stale jobs (created before the instance's affliction_date) are treated as having no status for ordering purposes.",
			values: ["affliction_date", "asset.name", "remediation.status"],
			optional: true,
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
		"remediation-statuses": {
			kind: "parsed",
			brief:
				"Filter finding instances by most recent remediation job status. Supports multiple comma-separated values.\nUse 'none' to filter instances with no remediation jobs or instances where the most recent job is stale.\nNote: Stale jobs (created before the instance's affliction_date) are ignored for filtering purposes, but are still included in the 'remediations' array with stale=true.",
			variadic: true,
			optional: true,
			choices: [
				"none",
				"pending",
				"processing",
				"validating",
				"completed",
				"failed",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"finding-instance-ids": {
			kind: "parsed",
			brief:
				"Filter finding instances by an array of finding instance IDs. Supports multiple comma-separated values.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"asset-ids": {
			kind: "parsed",
			brief:
				"Filter finding instances by an array of asset IDs. Supports multiple comma-separated values.",
			variadic: true,
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
	describe: "List instances of a finding",
	usage:
		"$0 zero-trust casb findings instances list\n\nLists all security finding instances for a given security finding.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
