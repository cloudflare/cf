/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"account-id-body": {
			kind: "parsed",
			brief: "The accountId field",
			optional: true,
			parse: String,
		},
		"account-tag": {
			kind: "parsed",
			brief: "The accountTag field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "group-id", brief: "Group ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <group-id>",
	describe: "Add an account to a group",
	usage:
		"$0 cloudforce-one threat-intel datasets access groups members create <group-id>\n\nAdds an account to an account group. Identify the account by `accountId` or `accountTag`.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
