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
		contents: {
			kind: "parsed",
			brief: "Actual contents of the PAC file",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Detailed description of the PAC file.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the PAC file.",
			optional: true,
			parse: String,
		},
		slug: {
			kind: "parsed",
			brief:
				"URL-friendly version of the PAC file name. If not provided, it will be auto-generated",
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
	describe: "Create a PAC file",
	usage:
		"$0 zero-trust gateway pacfiles create\n\nCreate a new Zero Trust Gateway PAC file.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
