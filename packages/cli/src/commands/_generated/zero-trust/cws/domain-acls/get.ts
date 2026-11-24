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
			placeholder: "domain-acl-id",
			brief: "ID of the domain ACL to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <domain-acl-id>",
	describe: "Get a domain ACL by ID",
	usage:
		"$0 zero-trust cws domain-acls get <domain-acl-id>\n\nReturns the domain access control list with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
