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
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "connector-id",
			brief: "UUID of the Cloudflare Tunnel connector.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <connector-id>",
	describe: "Get Cloudflare Tunnel connector",
	usage:
		"$0 tunnels connectors get <connector-id>\n\nRetrieves a connector and its connection details for a Cloudflare Tunnel, including its cloudflared version, architecture, and connected Cloudflare locations.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
