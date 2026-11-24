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
	describe: "List webhook configurations",
	usage:
		"$0 zero-trust casb webhooks list\n\nRetrieves all webhook configurations for the authenticated account. Returns an array of webhook configurations that can be used to send finding notifications.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
