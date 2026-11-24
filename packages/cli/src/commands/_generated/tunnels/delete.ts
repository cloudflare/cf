/**
 * delete command
 * @generated from apis/overlays/tunnels.ts
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
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <tunnel-id>",
	describe: "Delete a Cloudflare Tunnel",
	usage:
		"$0 tunnels delete <tunnel-id>\n\nPermanently deletes a Cloudflare Tunnel from an account. The tunnel must have no active connections.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
