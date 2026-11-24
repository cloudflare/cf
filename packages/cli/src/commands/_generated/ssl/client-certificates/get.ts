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
			placeholder: "client-certificate-id",
			brief: "Client Certificate Tag",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <client-certificate-id>",
	describe: "Client Certificate Details",
	usage:
		"$0 ssl client-certificates get <client-certificate-id>\n\nGet Details for a single mTLS API Shield Client Certificate.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
