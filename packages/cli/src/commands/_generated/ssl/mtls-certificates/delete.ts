/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <mtls-certificate-id>",
	describe: "Delete mTLS certificate",
	usage:
		"$0 ssl mtls-certificates delete <mtls-certificate-id>\n\nDeletes the mTLS certificate unless the certificate is in use by one or more Cloudflare services.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
