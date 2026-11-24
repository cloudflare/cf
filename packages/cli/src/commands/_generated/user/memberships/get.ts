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
			placeholder: "membership-id",
			brief: "Membership identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <membership-id>",
	describe: "Get User Membership",
	usage:
		"$0 user memberships get <membership-id>\n\nGet a specific membership for the currently authenticated user.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
