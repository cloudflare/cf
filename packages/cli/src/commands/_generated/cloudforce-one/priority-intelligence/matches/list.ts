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
		"priority-id": { kind: "parsed", brief: "Priority ID", parse: String },
		cursor: {
			kind: "parsed",
			brief:
				"`result_info.cursor` from the previous page. Omit for the newest matches.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Matches per page.",
			optional: true,
			parse: Number,
		},
		"triage-state": {
			kind: "enum",
			brief: "Only matches in this triage state.",
			values: ["new", "relevant", "not_relevant"],
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
	describe: "List a priority intelligence requirement's matched events",
	usage:
		"$0 cloudforce-one priority-intelligence matches list\n\nReturns the events matched by the PIR's query, newest match first. Each item has the Event List event fields plus the match fields. Only datasets the account can read now are included, and deleted events are left out, so a page can hold fewer items than `per_page` while `result_info.cursor` is still set. `backfill` matches came from the 30 days before the PIR was activated or its query changed and are never notified. `delivered` matches were included in a digest that the notification service accepted; who receives it depends on the account's notification policies for the PIR. Requires the Threat Events entitlement.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
