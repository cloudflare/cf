/**
 * ignore command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		checks: {
			kind: "parsed",
			brief: "A list of finding IDs to pass along.",
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
			brief: "Request body for bulk actions on findings.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "ignore",
	describe: "Mark a finding as ignored",
	usage:
		"$0 zero-trust casb findings ignore\n\nGiven a list of findings, mark as ignored. Does nothing if Finding is already ignored.",
	...parameters,
	loader: () => import("./ignore.handler.js"),
});

export default command;
