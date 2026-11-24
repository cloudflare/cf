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
			placeholder: "certificate-id",
			brief: "Certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <certificate-id>",
	describe: "Delete Hostname Client Certificate",
	usage:
		"$0 ssl origin-tls-client-auth hostname-certificates delete <certificate-id>\n\nRemoves a client certificate used for authenticated origin pulls on a specific hostname. Note: Before deleting the certificate, you must first invalidate the hostname for client authentication by sending a PUT request with `enabled` set to null. After invalidating the association, the certificate can be safely deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
