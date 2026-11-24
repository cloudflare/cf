/**
 * list command
 * @generated from apis/overlays/reporting.ts
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
	describe: "List generated reports",
	usage:
		"$0 reporting reports list\n\nLists all generated reports for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
