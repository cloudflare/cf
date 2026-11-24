/**
 * create command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
		{ placeholder: "workflow-name", brief: "Workflow name", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <workflow-name>",
	describe: "Batch create new Workflow instances",
	usage:
		"$0 workflows instances batch create <workflow-name>\n\nCreates multiple workflow instances in a single batch operation.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
