/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <member-id>",
	describe: "Remove User Group Member",
	usage:
		"$0 iam user-groups members delete <member-id>\n\nRemove a member from User Group",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
