/**
 * query command
 * @generated from apis/overlays/vectorize.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		filter: {
			kind: "parsed",
			brief:
				'A metadata filter expression used to limit nearest neighbor results. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"return-metadata": {
			kind: "parsed",
			brief:
				"Whether to return no metadata, indexed metadata or all metadata associated with the closest vectors.",
			default: "none",
			choices: ["none", "indexed", "all"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "return-metadata", "text"),
		},
		"return-values": {
			kind: "boolean",
			brief:
				"Whether to return the values associated with the closest vectors.",
			default: false,
		},
		"top-k": {
			kind: "parsed",
			brief: "The number of nearest neighbors to find.",
			default: "5",
			parse: Number,
		},
		vector: {
			kind: "parsed",
			brief:
				"The search vector that will be used to find the nearest neighbors.",
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
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "query <index-name>",
	describe: "Query Vectors",
	usage:
		"$0 vectorize vectors query <index-name>\n\nFinds vectors closest to a given vector in an index.",
	...parameters,
	loader: () => import("./query.handler.js"),
});

export default command;
