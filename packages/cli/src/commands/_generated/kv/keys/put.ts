/**
 * put command
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
		expiration: {
			kind: "parsed",
			brief:
				"Expires the key at a certain time, measured in number of seconds since the UNIX epoch.",
			optional: true,
			parse: Number,
		},
		"expiration-ttl": {
			kind: "parsed",
			brief:
				"Number of seconds until the key expires. Must be at least 60. Takes precedence over `expiration` when both are specified.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "A byte sequence to be stored, up to 25 MiB in length.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief: "Associates arbitrary JSON data with a key/value pair.",
			optional: true,
			parse: String,
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
	command: "put <key-name>",
	describe: "Write a key-value pair with optional metadata",
	usage:
		"$0 kv keys put <key-name>\n\nWrites a value under the specified key in the Workers KV namespace, creating the key-value pair or replacing its existing value, expiration, and metadata. Send the value as an `application/octet-stream` request body, or use `multipart/form-data` with a `value` part and an optional JSON `metadata` part. Use URL-encoding for special characters (for example, `:`, `!`, `%`) in the key name when constructing the request URL. If neither `expiration` nor `expiration_ttl` is specified, the key-value pair will not expire. If both are set, `expiration_ttl` takes precedence.",
	...parameters,
	loader: () => import("./put.handler.js"),
});

export default command;
