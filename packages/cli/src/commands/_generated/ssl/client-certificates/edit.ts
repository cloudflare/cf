/**
 * edit command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		reactivate: {
			kind: "boolean",
			brief: "The reactivate field",
			optional: true,
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
	command: "edit <client-certificate-id>",
	describe: "Reactivate Client Certificate",
	usage:
		"$0 ssl client-certificates edit <client-certificate-id>\n\nIf a API Shield mTLS Client Certificate is in a pending_revocation state, you may reactivate it with this endpoint.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
