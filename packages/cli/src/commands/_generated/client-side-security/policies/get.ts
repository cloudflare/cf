/**
 * get command
 * @generated from apis/overlays/client-side-security.ts
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
	operands: [{ placeholder: "policy-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-id>",
	describe: "Get a content security rule",
	usage:
		"$0 client-side-security policies get <policy-id>\n\nReturns a content security rule by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
