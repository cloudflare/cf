/**
 * get command
 * @generated from apis/overlays/workflows.ts
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
		{
			placeholder: "key-id",
			brief: "Identifier of the concurrency key.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <key-id>",
	describe: "Get concurrency key details",
	usage:
		"$0 workflows concurrency get <key-id>\n\nRetrieves a concurrency key and the workflows whose latest version references it.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
