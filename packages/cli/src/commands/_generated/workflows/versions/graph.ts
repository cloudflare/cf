/**
 * graph command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "version-id", brief: "Version ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "graph <version-id>",
	describe: "Get Workflow version graph",
	usage:
		"$0 workflows versions graph <version-id>\n\nRetrieves the graph visualization of a workflow version.",
	...parameters,
	loader: () => import("./graph.handler.js"),
});

export default command;
