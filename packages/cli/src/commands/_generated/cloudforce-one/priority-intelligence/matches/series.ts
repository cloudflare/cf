/**
 * series command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		since: {
			kind: "parsed",
			brief:
				"Start of the range, inclusive, on when each matched event was added to its dataset. ISO 8601; defaults to 30 days before `until`.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief:
				"End of the range, exclusive. ISO 8601; defaults to now. The range is at most 90 days.",
			optional: true,
			parse: String,
		},
		"triage-state": {
			kind: "enum",
			brief: "Only matches in this triage state.",
			values: ["new", "relevant", "not_relevant"],
			optional: true,
		},
		"include-backfill": {
			kind: "enum",
			brief:
				"Include matches from the 30 days before activation. Defaults to true.",
			values: ["true", "false"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "priority-id", brief: "Priority ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "series <priority-id>",
	describe:
		"Count a priority intelligence requirement's matched events per day",
	usage:
		"$0 cloudforce-one priority-intelligence matches series <priority-id>\n\nReturns the PIR's matches per UTC day of when each matched event was added to its dataset, over the same matches as the matches list, in datasets the account can read now. Every day in the range is listed, including days with no matches. The range defaults to the last 30 days and is at most 90 days, because matches are kept for 90 days. Days before the PIR was activated hold only the most recent backfill matches. Requires the Threat Events entitlement.",
	...parameters,
	loader: () => import("./series.handler.js"),
});

export default command;
