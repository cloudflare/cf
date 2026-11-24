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
		comment: {
			kind: "parsed",
			brief: "An comment describing the allowlist prefix.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether to enable the allowlist prefix into effect.",
			optional: true,
		},
		prefix: {
			kind: "parsed",
			brief: "The allowlist prefix to add in CIDR format.",
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
			brief: "The new allowlist prefix to create.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create allowlist prefix.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs allowlist create\n\nCreate an allowlist prefix for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
