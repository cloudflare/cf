/**
 * get command
 * @generated from apis/overlays/dls.ts
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
			placeholder: "binding-id",
			brief: "Unique identifier for the prefix binding.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <binding-id>",
	describe: "Get a DLS prefix binding",
	usage:
		"$0 dls regional-services prefix-bindings get <binding-id>\n\nRetrieve a single BYOIP prefix binding by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
