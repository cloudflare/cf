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
			placeholder: "client-certificate-id",
			brief: "Client Certificate Tag",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <client-certificate-id>",
	describe: "Revoke Client Certificate",
	usage:
		"$0 ssl client-certificates delete <client-certificate-id>\n\nSet a API Shield mTLS Client Certificate to pending_revocation status for processing to revoked status.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
