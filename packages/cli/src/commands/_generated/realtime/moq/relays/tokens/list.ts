/**
 * list command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"relay-id": {
			kind: "parsed",
			brief: "Relay unique identifier (32 hex characters).",
			parse: String,
		},
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
	describe: "List tokens",
	usage:
		"$0 realtime moq relays tokens list\n\nReturns metadata for every token the relay accepts. Secrets are never returned, so a token that has been lost cannot be recovered here. There is no expiry filter: compare each token's `expires` to the current time to tell which ones have lapsed.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
