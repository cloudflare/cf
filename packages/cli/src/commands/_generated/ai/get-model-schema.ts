/**
 * get-model-schema command
 * @generated from apis/overlays/ai.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		model: {
			kind: "parsed",
			brief: "AI model identifier, including its namespace and model name.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-model-schema",
	describe: "Get an AI model's input and output schemas",
	usage:
		"$0 ai get-model-schema\n\nRetrieves the input and output JSON Schema definitions for an AI model. Use these definitions to determine the model-specific request fields and response format.",
	...parameters,
	loader: () => import("./get-model-schema.handler.js"),
});

export default command;
