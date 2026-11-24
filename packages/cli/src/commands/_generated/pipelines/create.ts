/**
 * create command
 * @generated from apis/overlays/pipelines.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "Specifies the name of the Pipeline.",
			optional: true,
			parse: String,
		},
		sql: {
			kind: "parsed",
			brief: "Specifies SQL for the Pipeline processing flow.",
			optional: true,
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Pipeline",
	usage: "$0 pipelines create\n\nCreate a new Pipeline.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
