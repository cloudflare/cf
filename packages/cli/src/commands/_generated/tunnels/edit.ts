/**
 * edit command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "A user-friendly name for a tunnel.",
			optional: true,
			parse: String,
		},
		"tunnel-secret": {
			kind: "parsed",
			brief:
				"Sets the password required to run a locally-managed tunnel. Must be at least 32 bytes and encoded as a base64 string.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <tunnel-id>",
	describe: "Update a Cloudflare Tunnel",
	usage:
		"$0 tunnels edit <tunnel-id>\n\nUpdates the name or secret of an existing Cloudflare Tunnel.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
