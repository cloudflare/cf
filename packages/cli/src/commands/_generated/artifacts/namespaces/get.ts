/**
 * get command
 * @generated from apis/overlays/artifacts.ts
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
			brief: "Artifacts namespace name.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <namespace>",
	describe: "Get a namespace",
	usage:
		"$0 artifacts namespaces get <namespace>\n\nReturns an Artifacts namespace summary.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
