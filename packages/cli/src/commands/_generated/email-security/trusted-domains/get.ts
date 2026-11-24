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
			placeholder: "trusted-domain-id",
			brief: "Trusted domain identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <trusted-domain-id>",
	describe: "Get a trusted email domain",
	usage:
		"$0 email-security trusted-domains get <trusted-domain-id>\n\nRetrieves details for a specific trusted domain pattern including its pattern value, whether it uses regex matching, and which detection types it affects.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
