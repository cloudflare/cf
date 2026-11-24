/**
 * aggregate-all command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "aggregate-all",
	describe:
		"Count matched events across the account's priority intelligence requirements",
	usage:
		"$0 cloudforce-one priority-intelligence matches aggregate-all\n\nReturns each active PIR's match counts, with the same fields and filters as a single PIR's aggregate, and the number of distinct values of each field across all of them, each value counted once. Counts are not summed across PIRs: an event can match several PIRs. Drafts are left out; PIRs the matcher paused are included. A PIR whose matches cannot be counted is returned with `error` and left out of `combined`. Requires the Threat Events entitlement.",
	...parameters,
	loader: () => import("./aggregate-all.handler.js"),
});

export default command;
