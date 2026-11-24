/**
 * psk-set command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"validate-only": {
			kind: "boolean",
			brief: "If `true`, only run validation without persisting changes.",
			optional: true,
		},
		psks: {
			kind: "parsed",
			brief:
				'List of tunnel ID and PSK pairs. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"psk": string}].',
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
			brief: "Request body for setting PSKs for multiple IPsec tunnels.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "psk-set",
	describe: "Set Pre-Shared Keys (PSK) for IPsec tunnels",
	usage:
		"$0 magic-transit ipsec-tunnels psk-set\n\nSets Pre-Shared Keys for multiple IPsec tunnels associated with an account. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes. After PSKs are applied, they are immediately persisted to Cloudflare's edge and cannot be retrieved later. Store the PSKs in a safe place.",
	...parameters,
	loader: () => import("./psk-set.handler.js"),
});

export default command;
