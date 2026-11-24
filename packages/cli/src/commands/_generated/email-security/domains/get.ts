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
	describe: "Get an email domain",
	usage:
		"$0 email-security domains get <domain-id>\n\nRetrieves detailed information for a specific protected email domain including its delivery configuration, SPF/DMARC status, and authorization state.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
