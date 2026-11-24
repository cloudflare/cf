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
		certificate: {
			kind: "parsed",
			brief: "The hostname certificate.",
			optional: true,
			parse: String,
		},
		"private-key": {
			kind: "parsed",
			brief: "The hostname certificate's private key.",
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
	describe: "Upload a Hostname Client Certificate",
	usage:
		"$0 ssl origin-tls-client-auth hostname-certificates create\n\nUpload a certificate to be used for client authentication on a hostname. 10 hostname certificates per zone are allowed.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
