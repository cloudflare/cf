/**
 * get command
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
	},
	operands: [
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <tunnel-id>",
	describe: "Get a Cloudflare Tunnel token",
	usage:
		"$0 tunnels token get <tunnel-id>\n\nRetrieves the token used to run cloudflared and associate it with a specific Cloudflare Tunnel. Treat the token as a secret.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
