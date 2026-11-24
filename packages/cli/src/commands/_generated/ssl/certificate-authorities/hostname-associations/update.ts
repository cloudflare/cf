/**
 * update command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		hostnames: {
			kind: "parsed",
			brief:
				"Unordered set of hostnames. Hostnames are stored as lowercase punycode.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"mtls-certificate-id": {
			kind: "parsed",
			brief:
				"The UUID for a certificate that was uploaded to the mTLS Certificate Management endpoint. If no mtls_certificate_id is given, the hostnames will be associated to your active Cloudflare Managed CA.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Replace Hostname Associations",
	usage:
		"$0 ssl certificate-authorities hostname-associations update\n\nReplace Hostname Associations.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
