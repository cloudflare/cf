/**
 * get command
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
	},
	operands: [
		{ placeholder: "workflow-name", brief: "Workflow name", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <workflow-name>",
	describe: "Get Workflow details",
	usage:
		"$0 workflows get <workflow-name>\n\nRetrieves configuration and metadata for a specific workflow.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
