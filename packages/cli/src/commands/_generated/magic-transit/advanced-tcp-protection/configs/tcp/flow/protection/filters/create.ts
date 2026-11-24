/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		expression: {
			kind: "parsed",
			brief: "The filter expression.",
			optional: true,
			parse: String,
		},
		"filter-mode": {
			kind: "parsed",
			brief:
				"The filter's mode. Must be one of 'enabled', 'disabled', 'monitoring'.",
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
			brief: "The new filter to create.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a TCP Flow Protection filter.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection filters create\n\nCreate a TCP Flow Protection filter for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
