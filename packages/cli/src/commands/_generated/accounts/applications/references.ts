/**
 * references command
 * @generated from apis/overlays/accounts.ts
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
			placeholder: "id",
			brief: "Application ID of a custom application in the account.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "references <id>",
	describe: "Get application references",
	usage:
		"$0 accounts applications references <id>\n\nList the resources in the account that reference a custom application, such as Gateway rules. This is the same list a delete of the application returns when it is rejected. A delete checks the references again, so the list can change before the delete runs.",
	...parameters,
	loader: () => import("./references.handler.js"),
});

export default command;
