/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"sensitivity-group-id": {
			kind: "parsed",
			brief: "Sensitivity group ID",
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
	describe: "Retrieve all sensitivity levels in a sensitivity group",
	usage:
		"$0 zero-trust dlp sensitivity-levels list\n\nLists sensitivity levels in a sensitivity group.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
