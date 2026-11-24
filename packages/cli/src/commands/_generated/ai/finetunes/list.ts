/**
 * list command
 * @generated from apis/overlays/ai.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Finetunes",
	usage:
		"$0 ai finetunes list\n\nLists all fine-tuning jobs created by the account, including status and metrics.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
