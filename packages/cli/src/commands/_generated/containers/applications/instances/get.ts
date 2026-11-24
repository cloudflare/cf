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
		"application-id": {
			kind: "parsed",
			brief: "An Application ID represents an identifier of an application.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "instance-id",
			brief:
				"A container instance ID (64-character hex Durable Object actor ID).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <instance-id>",
	describe: "Get a container instance",
	usage:
		"$0 containers applications instances get <instance-id>\n\nReturns a container instance belonging to an application.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
