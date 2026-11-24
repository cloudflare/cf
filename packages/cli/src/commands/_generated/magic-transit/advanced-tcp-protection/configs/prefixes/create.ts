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
			brief: "A comment describing the prefix.",
			optional: true,
			parse: String,
		},
		excluded: {
			kind: "boolean",
			brief: "Whether to exclude the prefix from protection.",
			optional: true,
		},
		prefix: {
			kind: "parsed",
			brief: "The prefix to add in CIDR format.",
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
			brief: "The new prefix to create.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create prefix.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs prefixes create\n\nCreate a prefix for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
