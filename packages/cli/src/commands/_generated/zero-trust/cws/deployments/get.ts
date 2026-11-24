/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "deployment-id",
			brief: "ID of the deployment to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <deployment-id>",
	describe: "Get a deployment by ID",
	usage:
		"$0 zero-trust cws deployments get <deployment-id>\n\nReturns the deployment with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
