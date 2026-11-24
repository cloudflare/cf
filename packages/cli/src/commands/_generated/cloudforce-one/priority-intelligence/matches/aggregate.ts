/**
 * aggregate command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"aggregate-by": {
			kind: "parsed",
			brief:
				"Comma-separated fields to count: tags, attacker, attacker_country, target_industry, indicator, indicator_type. `indicator` is each event's primary indicator, the first one it was created with.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Top values returned per field.",
			optional: true,
			parse: Number,
		},
		since: {
			kind: "parsed",
			brief: "Only matches first matched at or after this ISO 8601 time.",
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
	command: "aggregate <priority-id>",
	describe: "Count a priority intelligence requirement's matched events",
	usage:
		"$0 cloudforce-one priority-intelligence matches aggregate <priority-id>\n\nCounts the PIR's matches by tag, attacker, attacker country, target industry, primary indicator, or indicator type: the top values, the number of distinct values, and the matches without a value. Covers the same matches as the matches list, in datasets the account can read now. Tags are grouped case-insensitively and shown with their most common spelling; an event counts once for each of its tags. `indicator` is the first indicator each event was created with. Field values are copied when an event matches; matches still being copied are reported in `matches.pending` and not counted, and matches whose event was already gone when its fields were copied in `matches.missing`. Counts keep the copied values, so an event deleted later stays counted. Requires the Threat Events entitlement.",
	...parameters,
	loader: () => import("./aggregate.handler.js"),
});

export default command;
