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
		"script-name": {
			kind: "parsed",
			brief: "Name of the script.",
			parse: String,
		},
		"url-encoded": {
			kind: "boolean",
			brief: "Flag that indicates whether the secret name is URL encoded.",
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
		{
			placeholder: "secret-name",
			brief: "A JavaScript variable name for the secret binding.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <secret-name>",
	describe: "Delete Workers for Platforms script secret",
	usage:
		'$0 workers-for-platforms dispatch-namespaces scripts secrets delete <secret-name>\n\nRemove a secret from a Workers for Platforms script by creating a new version without that secret. When changing more than one secret at a time, prefer the "Patch multiple script secrets" API instead of changing many secrets individually.',
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
