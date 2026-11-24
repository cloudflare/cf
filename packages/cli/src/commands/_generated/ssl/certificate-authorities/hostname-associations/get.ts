/**
 * get command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"mtls-certificate-id": {
			kind: "parsed",
			brief:
				"The UUID to match against for a certificate that was uploaded to the mTLS Certificate Management endpoint. If no mtls_certificate_id is given, the results will be the hostnames associated to your active Cloudflare Managed CA.",
			optional: true,
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
	command: "get",
	describe: "List Hostname Associations",
	usage:
		"$0 ssl certificate-authorities hostname-associations get\n\nList Hostname Associations.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
