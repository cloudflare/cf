/**
 * history command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "The unique ID that identifies the organization.",
			parse: String,
		},
		"action-time": {
			kind: "parsed",
			brief:
				"RFC3339 timestamp of the source audit log entry's action time. Used to narrow the source-entry lookup window. Provide the `action.time` value from the audit log identified by `id`.",
			parse: String,
		},
		since: {
			kind: "parsed",
			brief:
				"Limits the returned results to logs newer than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			parse: String,
		},
		before: {
			kind: "parsed",
			brief:
				"Limits the returned results to logs older than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Sets sorting order.",
			values: ["desc", "asc"],
			optional: true,
		},
		limit: {
			kind: "parsed",
			brief:
				"The number limits the objects to return. The cursor attribute may be used to iterate over the next batch of objects if there are more than the limit.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"The cursor is an opaque token used to paginate through large sets of records. It indicates the position from which to continue when requesting the next set of records. A valid cursor value can be obtained from the cursor object in the result_info structure of a previous response.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "id",
			brief: "The ID of the audit log to fetch resource history for.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "history <id>",
	describe:
		"Get resource change history from an organization audit log entry (Version 2)",
	usage:
		"$0 organizations logs audit history <id>\n\nReturns the chronological change history for the resource identified by the given organization-scoped audit log entry. The endpoint first locates the source audit log entry by `id` (using `action_time` to narrow the lookup window), derives identifying filters from that entry, and then returns matching audit logs within the `since`/`before` window. The `result_info.history_status` field indicates the quality of the resource identification used: - `exact`: Resource was identified by the resource URI. - `approximate`: Resource was identified without the resource URI. - `unavailable`: The source audit log entry did not contain enough information to identify the resource; an empty result is returned.",
	...parameters,
	loader: () => import("./history.handler.js"),
});

export default command;
