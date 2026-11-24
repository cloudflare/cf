/**
 * get command
 * @generated from apis/overlays/realtime.ts
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
	operands: [
		{
			placeholder: "relay-id",
			brief: "Relay unique identifier (32 hex characters).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <relay-id>",
	describe: "Get a relay",
	usage:
		"$0 realtime moq relays get <relay-id>\n\nRetrieves a single MoQ relay including config and status. Tokens are NOT included.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
