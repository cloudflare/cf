/**
 * get command
 * @generated from apis/overlays/dns.ts
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
	operands: [{ placeholder: "acl-id", brief: "Acl ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <acl-id>",
	describe: "ACL Details",
	usage: "$0 dns zone-transfers acls get <acl-id>\n\nGet ACL.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
