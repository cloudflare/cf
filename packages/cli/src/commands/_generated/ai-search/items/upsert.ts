/**
 * upsert command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		key: {
			kind: "parsed",
			brief: "Item key / filename. Must not exceed 128 characters.",
			optional: true,
			parse: String,
		},
		"next-action": {
			kind: "parsed",
			brief: "The next_action field",
			optional: true,
			choices: ["INDEX"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "next-action", "text"),
		},
		"wait-for-completion": {
			kind: "boolean",
			brief:
				"Wait for indexing before responding. After processing, vector-indexed instances use any time remaining in a 25s wait budget to confirm Vectorize ingestion. Processing itself continues uninterrupted and can exceed that budget. If confirmation times out, the response returns the current item state and background indexing continues. Defaults to false.",
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
	},
	operands: [
		{
			placeholder: "instance-id",
			brief: "AI Search instance ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "upsert <instance-id>",
	describe: "Create or Update Item.",
	usage:
		"$0 ai-search items upsert <instance-id>\n\nCreates or updates an indexed item in an AI Search instance.",
	...parameters,
	loader: () => import("./upsert.handler.js"),
});

export default command;
