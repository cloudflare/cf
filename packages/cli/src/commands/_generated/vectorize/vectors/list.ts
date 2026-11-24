/**
 * list command
 * @generated from apis/overlays/vectorize.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"index-name": { kind: "parsed", brief: "Index name", parse: String },
		"result-count": {
			kind: "parsed",
			brief: "Maximum number of vectors to return",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief: "Cursor for pagination to get the next page of results",
			optional: true,
			parse: String,
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
	describe: "List Vectors",
	usage:
		"$0 vectorize vectors list\n\nReturns a paginated list of vector identifiers from the specified index.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
