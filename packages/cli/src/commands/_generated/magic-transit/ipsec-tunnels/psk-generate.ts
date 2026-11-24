/**
 * psk-generate command
 * @generated from apis/overlays/magic-transit.ts
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
		{ placeholder: "ipsec-tunnel-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "psk-generate <ipsec-tunnel-id>",
	describe: "Generate Pre-Shared Key (PSK) for IPsec tunnels",
	usage:
		"$0 magic-transit ipsec-tunnels psk-generate <ipsec-tunnel-id>\n\nGenerates a Pre-Shared Key for a specific IPsec tunnel used in the IKE session. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes. After a PSK is generated, the PSK is immediately persisted to Cloudflare's edge and cannot be retrieved later. Store the PSK in a safe place.",
	...parameters,
	loader: () => import("./psk-generate.handler.js"),
});

export default command;
