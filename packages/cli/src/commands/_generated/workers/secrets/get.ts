/**
 * get command
 * @generated from apis/overlays/workers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Name of the script.",
			optional: true,
			alias: ["script-name", "worker-id"],
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
	describe: "Get a secret binding",
	usage:
		"$0 workers secrets get <secret-name>\n\nGet a given secret binding (value omitted) on a Worker script.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
