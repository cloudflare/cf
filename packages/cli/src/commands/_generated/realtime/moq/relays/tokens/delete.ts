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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "jti",
			brief: "Token identifier (jti — 32 hex characters).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <jti>",
	describe: "Revoke a token",
	usage:
		"$0 realtime moq relays tokens delete <jti>\n\nRevokes a token by removing it from the set the relay accepts. Relays cache that set, so revocation takes effect within seconds rather than instantly, and connections already established with the token are not closed. Revoking an unknown token succeeds, so the call is idempotent.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
