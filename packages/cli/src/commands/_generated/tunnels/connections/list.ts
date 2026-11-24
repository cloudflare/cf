/**
 * list command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Cloudflare Tunnel connections",
	usage:
		"$0 tunnels connections list\n\nLists the connections for a Cloudflare Tunnel, including connector IDs, cloudflared versions, and Cloudflare locations.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
