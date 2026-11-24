/**
 * create command
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
		"index-config-dimensions": {
			kind: "parsed",
			brief: "Specifies the number of dimensions for the index",
			optional: true,
			parse: Number,
		},
		"index-config-metric": {
			kind: "parsed",
			brief: "Specifies the type of metric to use calculating distance.",
			optional: true,
			choices: ["cosine", "euclidean", "dot-product"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "index-config-metric", "text"),
		},
		"index-config-preset": {
			kind: "parsed",
			brief: "Specifies the preset to use for the index.",
			optional: true,
			choices: [
				"@cf/baai/bge-small-en-v1.5",
				"@cf/baai/bge-base-en-v1.5",
				"@cf/baai/bge-large-en-v1.5",
				"openai/text-embedding-ada-002",
				"cohere/embed-multilingual-v2.0",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "index-config-preset", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Specifies the description of the index.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
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
	rules(rules) {
		rules.conflicts("index-config-dimensions", ["index-config-preset"]);
		rules.implies("index-config-dimensions", ["index-config-metric"]);
		rules.conflicts("index-config-metric", ["index-config-preset"]);
		rules.implies("index-config-metric", ["index-config-dimensions"]);
		rules.conflicts("index-config-preset", [
			"index-config-dimensions",
			"index-config-metric",
		]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Vectorize Index",
	usage: "$0 vectorize create\n\nCreates and returns a new Vectorize Index.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
