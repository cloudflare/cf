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
			placeholder: "certificate-id",
			brief: "Certificate identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <certificate-id>",
	describe: "Get Certificate Details",
	usage:
		"$0 ssl origin-tls-client-auth zone-certificates get <certificate-id>\n\nRetrieves details for a specific client certificate used in zone-level authenticated origin pulls.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
