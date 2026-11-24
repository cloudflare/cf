/**
 * list command
 * @generated from apis/overlays/logpush.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"transformer-id": {
			kind: "parsed",
			brief: "The transformer ID.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of versions to return.",
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
	describe: "List transformer versions",
	usage:
		"$0 logpush transformers versions list\n\nReturns version metadata for a transformer, newest first. Each version corresponds to a SQL query update.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
