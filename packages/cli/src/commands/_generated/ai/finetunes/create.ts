/**
 * create command
 * @generated from apis/overlays/ai.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		model: {
			kind: "parsed",
			brief: "The model field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		public: { kind: "boolean", brief: "The public field", default: false },
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
	command: "create",
	describe: "Create a new Finetune",
	usage:
		"$0 ai finetunes create\n\nCreates a new fine-tuning job for a Workers AI model using custom training data.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
