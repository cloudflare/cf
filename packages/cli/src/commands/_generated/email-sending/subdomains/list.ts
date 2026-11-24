/**
 * list command
 * @generated from apis/overlays/email-sending.ts
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
	describe: "List sending subdomains",
	usage:
		"$0 email-sending subdomains list\n\nLists all sending-enabled subdomains for the zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
