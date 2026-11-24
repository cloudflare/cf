/**
 * get command
 * @generated from apis/overlays/iam.ts
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
			placeholder: "user-group-id",
			brief: "User Group identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <user-group-id>",
	describe: "User Group Details",
	usage:
		"$0 iam user-groups get <user-group-id>\n\nGet information about a specific user group in an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
