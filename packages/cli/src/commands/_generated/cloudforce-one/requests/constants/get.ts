/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
		{ placeholder: "project-type", brief: "Project type", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <project-type>",
	describe: "Get request constants",
	usage:
		"$0 cloudforce-one requests constants get <project-type>\n\nReturns available priorities, statuses, and TLP levels for request workflows",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
