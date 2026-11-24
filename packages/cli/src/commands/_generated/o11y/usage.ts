/**
 * usage command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		from: {
			kind: "parsed",
			brief: "Unix timestamp in milliseconds for the start of the range.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "Unix timestamp in milliseconds for the end of the range.",
			parse: String,
		},
		tz: {
			kind: "parsed",
			brief:
				"IANA timezone used to align daily bins to local midnight (e.g. 'America/Chicago'). Defaults to UTC.",
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
	command: "usage",
	describe: "Get event count",
	usage:
		"$0 o11y usage\n\nEvent counts and sizes broken down by dataset and service, bucketed by day, for up to 90 days. The top-level events field is the sum of all breakdown counts.",
	...parameters,
	loader: () => import("./usage.handler.js"),
});

export default command;
