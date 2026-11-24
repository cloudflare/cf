/**
 * delete command
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
		"delete-with-references": {
			kind: "boolean",
			brief:
				"If true, delete the script even when other Workers still reference it. Service bindings in those Workers may be left broken. Durable Object namespaces implemented by the deleted script are deleted even if other Workers reference them.",
			optional: true,
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
	},
	operands: [
		{ placeholder: "script-name", brief: "Name of the script.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <script-name>",
	describe: "Delete Workers for Platforms Script",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts delete <script-name>\n\nDelete a script from a Workers for Platforms dispatch namespace. This call has no response body on a successful delete.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
