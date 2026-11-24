/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"project-type": { kind: "parsed", brief: "Project type", parse: String },
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
	command: "list",
	describe: "List visible request types for a project (dashboard)",
	usage:
		"$0 cloudforce-one requests types list\n\nReturns request types available to dashboard (external) callers. For restricted project types (e.g. legal-response), only the allowlisted subset is returned.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
