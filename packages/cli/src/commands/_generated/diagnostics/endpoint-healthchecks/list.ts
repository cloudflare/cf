/**
 * list command
 * @generated from apis/overlays/diagnostics.ts
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
	describe: "List Endpoint Health Checks",
	usage:
		"$0 diagnostics endpoint-healthchecks list\n\nList Endpoint Health Checks.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
