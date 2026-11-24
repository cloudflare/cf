/**
 * edit command
 * @generated from apis/overlays/acm.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"certificate-authority": {
			kind: "parsed",
			brief:
				"The Certificate Authority that Total TLS certificates will be issued through. Not returned in responses when Total TLS is disabled.",
			optional: true,
			choices: ["google", "lets_encrypt", "ssl_com"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "certificate-authority", "text"),
		},
		enabled: {
			kind: "boolean",
			brief:
				"If enabled, Total TLS will order a hostname specific TLS certificate for any proxied A, AAAA, or CNAME record in your zone.",
			optional: true,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Enable or Disable Total TLS",
	usage:
		"$0 acm total-tls edit\n\nSet Total TLS Settings or disable the feature for a Zone.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
