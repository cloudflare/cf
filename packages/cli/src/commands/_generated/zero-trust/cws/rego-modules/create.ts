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
		name: {
			kind: "parsed",
			brief: "Name of the Rego module (unique per account)",
			optional: true,
			parse: String,
		},
		"rego-source": {
			kind: "parsed",
			brief:
				'Library Rego source with a package beginning with "lib." Maximum 16384 UTF-8 bytes.',
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
	describe: "Create a new Rego module",
	usage:
		"$0 zero-trust cws rego-modules create\n\nCreates a library Rego module and derives its package path from the source.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
