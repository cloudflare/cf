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
			placeholder: "pattern-id",
			brief: "Blocked sender pattern identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pattern-id>",
	describe: "Get a blocked email sender",
	usage:
		"$0 email-security block-senders get <pattern-id>\n\nRetrieves details for a specific blocked sender pattern including its pattern type, value, and metadata.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
