/**
 * delete command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		instances: {
			kind: "parsed",
			brief: "The instances field",
			variadic: true,
			optional: true,
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
	operands: [
		{ placeholder: "workflow-name", brief: "Workflow name", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <workflow-name>",
	describe: "Batch delete instances of a workflow",
	usage:
		"$0 workflows instances batch delete <workflow-name>\n\nDeletes multiple workflow instances in a single batch operation.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
