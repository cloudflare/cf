/**
 * list command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dispatch-namespace": {
			kind: "parsed",
			brief: "Name of the Workers for Platforms dispatch namespace.",
			parse: String,
		},
		"script-name": {
			kind: "parsed",
			brief: "Name of the script.",
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
	command: "list",
	describe: "List Workers for Platforms Script Secrets",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts secrets list\n\nList secrets bound to a script uploaded to a Workers for Platforms dispatch namespace.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
