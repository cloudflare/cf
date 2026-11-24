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
			placeholder: "policy-set-id",
			brief: "ID of the policy set to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-set-id>",
	describe: "Get a policy set by ID",
	usage:
		"$0 zero-trust cws policy-sets get <policy-set-id>\n\nReturns the policy set with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
