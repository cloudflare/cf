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
	command: "get <secret-name>",
	describe: "Get Workers for Platforms Script Secret",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts secrets get <secret-name>\n\nGet a given secret binding (value omitted) on a script uploaded to a Workers for Platforms dispatch namespace.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
