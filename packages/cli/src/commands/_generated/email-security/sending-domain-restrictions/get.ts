/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
			placeholder: "sending-domain-restriction-id",
			brief: "Sending domain restriction identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <sending-domain-restriction-id>",
	describe: "Get a sending domain restriction",
	usage:
		"$0 email-security sending-domain-restrictions get <sending-domain-restriction-id>\n\nRetrieves details for a specific sending domain restriction including the domain requiring TLS and any excluded subdomains exempt from the TLS requirement.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
