/**
 * insert command
 * @generated from apis/overlays/vectorize.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"unparsable-behavior": {
			kind: "enum",
			brief: "Behavior for ndjson parse failures.",
			values: ["error", "discard"],
			optional: true,
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "insert <index-name>",
	describe: "Insert Vectors",
	usage:
		"$0 vectorize vectors insert <index-name>\n\nInserts vectors into the specified index and returns a mutation id corresponding to the vectors enqueued for insertion.",
	...parameters,
	loader: () => import("./insert.handler.js"),
});

export default command;
