/**
 * get command
 * @generated from apis/overlays/kv.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"namespace-id": {
			kind: "parsed",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "key-name",
			brief:
				"A key's name. The name may be at most 512 bytes. All printable, non-whitespace characters are valid. Use percent-encoding to define key names as part of a URL.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <key-name>",
	describe: "Get a key's metadata",
	usage:
		"$0 kv metadata get <key-name>\n\nReturns the JSON metadata associated with the specified key in the Workers KV namespace, without retrieving its value. Use URL-encoding for special characters (for example, `:`, `!`, `%`) in the key name when constructing the request URL.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
