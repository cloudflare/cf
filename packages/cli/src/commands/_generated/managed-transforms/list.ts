/**
 * list command
 * @generated from apis/overlays/managed-transforms.ts
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
	describe: "List Managed Transforms",
	usage:
		"$0 managed-transforms list\n\nFetches a list of all Managed Transforms.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
