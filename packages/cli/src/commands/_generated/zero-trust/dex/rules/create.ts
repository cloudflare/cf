/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		match: {
			kind: "parsed",
			brief: "The wirefilter expression to match.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the Rule.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a DEX Rule",
	usage: "$0 zero-trust dex rules create\n\nCreate a DEX Rule.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
