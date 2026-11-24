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
			placeholder: "policy-id",
			brief: "Content policy identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-id>",
	describe: "Get a content policy",
	usage:
		"$0 email-security content-policies get <policy-id>\n\nRetrieves details for a specific content policy including its pattern, targets, and metadata.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
