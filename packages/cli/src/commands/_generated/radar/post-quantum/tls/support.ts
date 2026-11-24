/**
 * support command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		host: {
			kind: "parsed",
			brief:
				"Hostname or IP address to test for Post-Quantum TLS support, optionally with port (defaults to 443).",
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
	command: "support",
	describe: "Check Post-Quantum TLS support",
	usage:
		"$0 radar post-quantum tls support\n\nTests whether a hostname or IP address supports Post-Quantum (PQ) TLS key exchange. Returns information about the negotiated key exchange algorithm, whether it uses PQ cryptography, and any detected TLS implementation bugs (Split ClientHello, HRR failure, etc.).",
	...parameters,
	loader: () => import("./support.handler.js"),
});

export default command;
