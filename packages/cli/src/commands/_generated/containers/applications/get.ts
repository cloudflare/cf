/**
 * get command
 * @generated from apis/overlays/containers.ts
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
			placeholder: "application-id",
			brief: "An Application ID represents an identifier of an application.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <application-id>",
	describe: "Get a single application by id",
	usage:
		"$0 containers applications get <application-id>\n\nReturns a single application by id.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
