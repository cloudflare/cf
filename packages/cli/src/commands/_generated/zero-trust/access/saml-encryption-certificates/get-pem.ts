/**
 * get-pem command
 * @generated from apis/overlays/zero-trust.ts
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
		{
			placeholder: "saml-cert-set-id",
			brief: "UID of the SAML certificate set.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-pem <saml-cert-set-id>",
	describe: "Download current certificate in PEM format",
	usage:
		"$0 zero-trust access saml-encryption-certificates get-pem <saml-cert-set-id>\n\nDownloads the current SAML encryption certificate's public key in PEM format for the specified certificate set. This endpoint is useful for providing the certificate to Identity Providers for SAML assertion encryption configuration.",
	...parameters,
	loader: () => import("./get-pem.handler.js"),
});

export default command;
