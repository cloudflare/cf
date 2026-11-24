/**
 * get command
 * @generated from apis/overlays/iam.ts
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
			placeholder: "sso-connector-id",
			brief: "SSO Connector identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <sso-connector-id>",
	describe: "Get single SSO connector",
	usage:
		"$0 iam sso get <sso-connector-id>\n\nRetrieves details for a specific SSO connector.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
