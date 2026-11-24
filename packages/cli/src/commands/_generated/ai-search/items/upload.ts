/**
 * upload command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief: "JSON string of custom metadata key-value pairs.",
			optional: true,
			parse: String,
		},
		"wait-for-completion": {
			kind: "boolean",
			brief:
				"Wait for indexing before responding. After processing, vector-indexed instances use any time remaining in a 25s wait budget to confirm Vectorize ingestion. Processing itself continues uninterrupted and can exceed that budget. If confirmation times out, the response returns the current item state and background indexing continues. Defaults to false.",
			optional: true,
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
	command: "upload <instance-id>",
	describe: "Upload Item.",
	usage:
		"$0 ai-search items upload <instance-id>\n\nUploads a file to a managed AI Search instance via multipart/form-data.",
	...parameters,
	loader: () => import("./upload.handler.js"),
});

export default command;
