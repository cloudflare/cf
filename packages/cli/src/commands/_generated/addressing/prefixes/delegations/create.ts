/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cidr: {
			kind: "parsed",
			brief: "IP Prefix in Classless Inter-Domain Routing format.",
			optional: true,
			parse: String,
		},
		"delegated-account-id": {
			kind: "parsed",
			brief:
				"Account identifier for the account to which prefix is being delegated.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "prefix-id",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <prefix-id>",
	describe: "Create Prefix Delegation",
	usage:
		"$0 addressing prefixes delegations create <prefix-id>\n\nCreate a new account delegation for a given IP prefix.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
