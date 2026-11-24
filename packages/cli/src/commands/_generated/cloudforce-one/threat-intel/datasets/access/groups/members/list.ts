/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"group-id": { kind: "parsed", brief: "Group ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List group members",
	usage:
		"$0 cloudforce-one threat-intel datasets access groups members list\n\nLists the accounts in an account group.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
