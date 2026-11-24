/**
 * get command
 * @generated from apis/overlays/ai-search.ts
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
			placeholder: "namespace",
			brief: "Namespace to retrieve.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <namespace>",
	describe: "Get a namespace",
	usage:
		"$0 ai-search namespace get <namespace>\n\nRetrieve a namespace and its description.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
