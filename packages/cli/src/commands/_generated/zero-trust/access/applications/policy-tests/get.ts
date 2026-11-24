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
			placeholder: "policy-test-id",
			brief: "The UUID of the policy test.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-test-id>",
	describe: "Get the current status of a given Access policy test",
	usage:
		"$0 zero-trust access applications policy-tests get <policy-test-id>\n\nFetches the current status of a given Access policy test.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
