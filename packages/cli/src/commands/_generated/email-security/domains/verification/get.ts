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
		{ placeholder: "domain-id", brief: "Domain identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <domain-id>",
	describe: "Get domain verification details",
	usage:
		"$0 email-security domains verification get <domain-id>\n\nReturns the DNS TXT record information when the domain ownership isn't verified through Cloudflare zone ownership or CASB integration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
