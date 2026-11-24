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
	describe: "List available target environments",
	usage:
		"$0 zero-trust devices client-versions target-environments list\n\nRetrieves a list of all available target environments with their display names. This endpoint is in Beta.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
