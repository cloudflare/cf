/**
 * list command
 * @generated from apis/overlays/alerting.ts
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
	describe: "Get Alert Types",
	usage:
		"$0 alerting available-alerts list\n\nGets a list of all alert types for which an account is eligible.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
