/**
 * empty command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		routes: {
			kind: "parsed",
			brief:
				"The routes field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{}].",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "empty",
	describe: "Delete Many Routes",
	usage:
		"$0 magic-transit routes empty\n\nDelete multiple Magic static routes.",
	...parameters,
	loader: () => import("./empty.handler.js"),
});

export default command;
