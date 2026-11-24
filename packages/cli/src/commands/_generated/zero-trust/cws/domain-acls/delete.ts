/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "domain-acl-id",
			brief: "ID of the domain ACL to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <domain-acl-id>",
	describe: "Delete a domain ACL",
	usage:
		"$0 zero-trust cws domain-acls delete <domain-acl-id>\n\nDeletes the domain ACL if it is not attached to a deployment.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
