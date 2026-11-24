/**
 * list command
 * @generated from apis/overlays/flagship.ts
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
	describe: "List apps",
	usage:
		"$0 flagship apps list\n\nLists all Flagship apps in the account. Returns identity and audit fields only; flag definitions are not included.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
