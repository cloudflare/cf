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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
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
	describe: "Get a key's value",
	usage:
		"$0 kv keys get <key-name>\n\nReturns the value stored under the specified key in the Workers KV namespace as raw bytes. Use URL-encoding for special characters (for example, `:`, `!`, `%`) in the key name when constructing the request URL. If the key-value pair expires, the `expiration` response header contains its expiration time in seconds since the UNIX epoch.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
