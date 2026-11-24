/**
 * bulk-delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	describe: "Delete multiple key-value pairs",
	usage:
		"$0 kv keys bulk-delete\n\nDeletes up to 10,000 key-value pairs from the specified Workers KV namespace. Send a JSON array of the key names to delete. The result reports the number of successful deletions and any keys that failed and should be retried.",
	...parameters,
	loader: () => import("./bulk-delete.handler.js"),
});

export default command;
