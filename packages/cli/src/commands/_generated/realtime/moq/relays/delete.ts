/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <relay-id>",
	describe: "Delete a relay",
	usage:
		"$0 realtime moq relays delete <relay-id>\n\nSoft-deletes a MoQ relay. The relay ID goes in the URL path — `DELETE /accounts/{account_id}/moq/relays/{relay_id}` — not the request body; there is no collection-level delete endpoint.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
