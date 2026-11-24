/**
 * get command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"setting-id": {
			kind: "parsed",
			brief:
				'The TLS Setting name.\nThe value type depends on the setting:\n- `ciphers`: value is an array of cipher suite strings (e.g., `["ECDHE-RSA-AES128-GCM-SHA256", "AES128-GCM-SHA256"]`).\n- `min_tls_version`: value is a TLS version string (`"1.0"`, `"1.1"`, `"1.2"`, or `"1.3"`).\n- `http2`: value is `"on"` or `"off"`.',
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
			placeholder: "hostname",
			brief: "The hostname for which the tls settings are set.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <hostname>",
	describe: "Get TLS setting for hostname",
	usage:
		"$0 zones hostnames settings tls-single get <hostname>\n\nGet the requested TLS setting for the hostname.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
