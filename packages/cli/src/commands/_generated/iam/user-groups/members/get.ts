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
		"user-group-id": {
			kind: "parsed",
			brief: "User Group identifier tag.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "member-id",
			brief: "The identifier of an existing account Member.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <member-id>",
	describe: "Get User Group Member",
	usage:
		"$0 iam user-groups members get <member-id>\n\nGet details of a specific member in a user group.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
