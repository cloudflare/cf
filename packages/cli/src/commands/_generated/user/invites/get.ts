/**
 * get command
 * @generated from apis/overlays/user.ts
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
			placeholder: "invite-id",
			brief: "Invite identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <invite-id>",
	describe: "Invitation Details",
	usage:
		"$0 user invites get <invite-id>\n\nGets the details of an invitation.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
