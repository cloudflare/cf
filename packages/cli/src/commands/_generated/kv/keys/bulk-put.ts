/**
 * bulk-put command
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
	command: "bulk-put",
	describe: "Write multiple key-value pairs",
	usage:
		"$0 kv keys bulk-put\n\nWrites up to 10,000 key-value pairs to the specified Workers KV namespace from a JSON array, with optional metadata and expiration settings for each pair. Existing values and expirations are overwritten. If neither `expiration` nor `expiration_ttl` is specified, the key-value pair will not expire. If both are set, `expiration_ttl` takes precedence. The entire request must be 100 megabytes or less. The result reports the number of successful writes and any keys that failed and should be retried.",
	...parameters,
	loader: () => import("./bulk-put.handler.js"),
});

export default command;
