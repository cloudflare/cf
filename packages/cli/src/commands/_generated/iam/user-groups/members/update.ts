/**
 * update command
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
		body: {
			kind: "parsed",
			brief: "Set/Replace members to a user group.",
			optional: true,
			parse: String,
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
	command: "update <user-group-id>",
	describe: "Update User Group Members",
	usage:
		"$0 iam user-groups members update <user-group-id>\n\nReplace the set of members attached to a User Group.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
