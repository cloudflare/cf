/**
 * get command
 * @generated from apis/overlays/waiting-rooms.ts
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
	command: "get",
	describe: "Get zone-level Waiting Room settings",
	usage:
		"$0 waiting-rooms settings get\n\nGet zone-level Waiting Room settings.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
