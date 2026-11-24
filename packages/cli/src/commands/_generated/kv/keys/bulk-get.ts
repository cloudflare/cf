/**
 * bulk-get command
 * @generated from apis/overlays/kv.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"namespace-id": {
			kind: "parsed",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
		keys: {
			kind: "parsed",
			brief: "Array of keys to retrieve (maximum of 100).",
			variadic: true,
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"Return values as strings with `text`, or parse stored JSON values with `json`.",
			default: "text",
			choices: ["text", "json"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"with-metadata": {
			kind: "boolean",
			brief: "Whether to include metadata in the response.",
			default: false,
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
	command: "bulk-get",
	describe: "Get multiple key-value pairs",
	usage:
		"$0 kv keys bulk-get\n\nRetrieves the text-based values of up to 100 keys from the specified Workers KV namespace. The result maps each requested key to its value. Set `type` to `json` to parse JSON values instead of returning strings, and set `withMetadata` to `true` to include metadata with each value. Binary values are not supported by this operation.",
	...parameters,
	loader: () => import("./bulk-get.handler.js"),
});

export default command;
