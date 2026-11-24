/**
 * bulk-delete command
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
		ids: {
			kind: "parsed",
			brief:
				"A list of vector identifiers to delete from the index indicated by the path.",
			variadic: true,
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
	command: "bulk-delete",
	describe: "Delete Vectors By Identifier",
	usage:
		"$0 vectorize vectors bulk-delete\n\nDelete a set of vectors from an index by their vector identifiers.",
	...parameters,
	loader: () => import("./bulk-delete.handler.js"),
});

export default command;
