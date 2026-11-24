/**
 * delete command
 * @generated from apis/overlays/vectorize.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	},
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <index-name>",
	describe: "Delete Vectorize Index",
	usage:
		"$0 vectorize delete <index-name>\n\nDeletes the specified Vectorize Index.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
