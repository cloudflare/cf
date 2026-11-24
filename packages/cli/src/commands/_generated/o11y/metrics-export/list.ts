/**
 * list command
 * @generated from apis/overlays/o11y.ts
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
	describe: "List Metrics Exports",
	usage:
		"$0 o11y metrics-export list\n\nList resources configured for Workers Observability metrics export.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
