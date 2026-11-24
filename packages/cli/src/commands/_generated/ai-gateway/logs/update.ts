/**
 * update command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"gateway-id": {
			kind: "parsed",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
		feedback: {
			kind: "parsed",
			brief: "The feedback field",
			optional: true,
			parse: Number,
		},
		metadata: {
			kind: "parsed",
			brief:
				'The metadata field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (string | number | boolean)}.',
			optional: true,
			parse: String,
		},
		score: {
			kind: "parsed",
			brief: "The score field",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <id>",
	describe: "Patch Gateway Log",
	usage:
		"$0 ai-gateway logs update <id>\n\nUpdates metadata for an AI Gateway log entry.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
