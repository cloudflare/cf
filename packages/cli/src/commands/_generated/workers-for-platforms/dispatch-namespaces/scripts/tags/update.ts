/**
 * update command
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
		body: {
			kind: "parsed",
			brief: "Tags associated with the Worker.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "script-name", brief: "Name of the script.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <script-name>",
	describe: "Replace Workers for Platforms Script Tags",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts tags update <script-name>\n\nReplace tags for a script uploaded to a Workers for Platforms dispatch namespace.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
