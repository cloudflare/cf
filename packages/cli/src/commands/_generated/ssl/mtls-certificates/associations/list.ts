/**
 * list command
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
			brief: "Certificate identifier tag.",
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
	command: "list",
	describe: "List mTLS certificate associations",
	usage:
		"$0 ssl mtls-certificates associations list\n\nLists all active associations between the certificate and Cloudflare services.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
