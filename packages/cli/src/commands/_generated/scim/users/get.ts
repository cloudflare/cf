/**
 * get command
 * @generated from apis/overlays/scim.ts
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
			placeholder: "user-id",
			brief: "The user tag identifying a SCIM User resource (account member).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <user-id>",
	describe: "Get SCIM User",
	usage:
		"$0 scim users get <user-id>\n\nRetrieves a single account member as a SCIM User resource by user tag.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
