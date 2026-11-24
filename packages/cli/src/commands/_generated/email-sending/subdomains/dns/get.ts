/**
 * get command
 * @generated from apis/overlays/email-sending.ts
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
			placeholder: "subdomain-id",
			brief: "Sending subdomain identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <subdomain-id>",
	describe: "Get sending subdomain DNS records",
	usage:
		"$0 email-sending subdomains dns get <subdomain-id>\n\nReturns the expected DNS records for a sending subdomain.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
