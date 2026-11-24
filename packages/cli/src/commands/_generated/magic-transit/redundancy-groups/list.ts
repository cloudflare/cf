/**
 * list command
 * @generated from apis/overlays/magic-transit.ts
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
	describe: "List Redundancy Groups",
	usage:
		"$0 magic-transit redundancy-groups list\n\nLists redundancy groups associated with an account, including full member tunnel data.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
