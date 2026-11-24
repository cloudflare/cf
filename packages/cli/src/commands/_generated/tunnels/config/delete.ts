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
	describe: "Reset Tunnel configuration",
	usage:
		"$0 tunnels config delete <tunnel-id>\n\nResets a remotely managed Cloudflare Tunnel to an empty configuration, removing ingress rules and origin request settings. The tunnel remains remotely managed, and private network routes continue to determine WARP routing. Publishes a new configuration version when the configuration changes. Repeated requests succeed without creating additional versions. If the tunnel or configuration is absent, returns a null result. Locally managed tunnels cannot be reset with this endpoint.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
