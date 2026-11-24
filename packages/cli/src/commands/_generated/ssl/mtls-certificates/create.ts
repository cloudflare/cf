/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		ca: {
			kind: "boolean",
			brief: "Indicates whether the certificate is a CA or leaf certificate.",
			optional: true,
		},
		certificates: {
			kind: "parsed",
			brief:
				"The uploaded root CA certificate. Responses return the certificates as Cloudflare stores them, re-encoded as PEM, not byte for byte as uploaded. Each certificate block ends with a newline, base64 lines are wrapped at 64 characters, text between blocks is dropped, and a chain may be reordered. Compare certificates by their decoded content rather than as strings.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Optional unique name for the certificate. Only used for human readability.",
			optional: true,
			parse: String,
		},
		"private-key": {
			kind: "parsed",
			brief:
				"The private key for the certificate. This field is only needed for specific use cases such as using a custom certificate with Zero Trust's block page.",
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
	command: "create",
	describe: "Upload mTLS certificate",
	usage:
		"$0 ssl mtls-certificates create\n\nUpload a certificate that you want to use with mTLS-enabled Cloudflare services, such as Bring Your Own CA (BYO-CA) for mTLS. To create certificates issued by the Cloudflare managed CA, use the [Create Client Certificate endpoint](/api/resources/client_certificates/methods/create/).",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
