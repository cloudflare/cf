/**
 * get command
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "script-name", brief: "Name of the script.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <script-name>",
	describe: "Get Workers for Platforms Script Bindings",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts bindings get <script-name>\n\nFetch bindings from a script uploaded to a Workers for Platforms dispatch namespace.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
