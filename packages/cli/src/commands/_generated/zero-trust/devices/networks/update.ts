/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"network-config-sha256": {
			kind: "parsed",
			brief:
				"The SHA-256 hash of the TLS certificate presented by the host found at tls_sockaddr. If absent, regular certificate verification (trusted roots, valid timestamp, etc) will be used to validate the certificate.",
			optional: true,
			parse: String,
		},
		"network-config-tls-sockaddr": {
			kind: "parsed",
			brief:
				'A network address of the form "host:port" that the WARP client will use to detect the presence of a TLS host.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the device managed network. This name must be unique.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type of device managed network.",
			optional: true,
			choices: ["tls"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	operands: [{ placeholder: "network-id", brief: "API UUID.", parse: String }],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"network-config-sha256",
				"network-config-tls-sockaddr",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["network-config-tls-sockaddr"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when one of --network-config-sha256, --network-config-tls-sockaddr is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <network-id>",
	describe: "Update a device managed network",
	usage:
		"$0 zero-trust devices networks update <network-id>\n\nUpdates a configured device managed network.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
