/**
 * list command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief: "ID of the resource group to be fetched.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the resource group to be fetched.",
			optional: true,
			parse: String,
		},
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
	describe: "List Resource Groups",
	usage:
		"$0 iam resource-groups list\n\nList all the resource groups for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
