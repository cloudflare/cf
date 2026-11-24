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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "mtls-certificate-id",
			brief: "Certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <mtls-certificate-id>",
	describe: "Get mTLS certificate",
	usage:
		"$0 ssl mtls-certificates get <mtls-certificate-id>\n\nFetches a single mTLS certificate uploaded to your account. To get a certificate issued by the Cloudflare managed CA, use the [Client Certificate Details endpoint](/api/resources/client_certificates/methods/get/).",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
