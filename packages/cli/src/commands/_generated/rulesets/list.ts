/**
 * list command
 * @generated from apis/overlays/rulesets.ts
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
			brief: "The cursor to use for the next page.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of rulesets to return per page.",
			optional: true,
			parse: Number,
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
	describe: "List account or zone rulesets",
	usage:
		"$0 rulesets list\n\nFetches all rulesets.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
