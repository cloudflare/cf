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
			placeholder: "policy-id",
			brief: "The UUID of the policy configuration to retrieve.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-id>",
	describe: "Get a policy configuration by ID",
	usage:
		"$0 zero-trust casb policies get <policy-id>\n\nRetrieves the details of a specific policy configuration, including its associated remediation and webhook actions.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
