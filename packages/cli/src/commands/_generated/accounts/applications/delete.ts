/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "id", brief: "Application ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <id>",
	describe: "Delete application",
	usage:
		"$0 accounts applications delete <id>\n\nDelete a custom application and all of its versions. Deletion is rejected when other resources reference the application.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
