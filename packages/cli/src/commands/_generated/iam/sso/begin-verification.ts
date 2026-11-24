/**
 * begin-verification command
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
	command: "begin-verification <sso-connector-id>",
	describe: "Begin SSO connector verification",
	usage:
		"$0 iam sso begin-verification <sso-connector-id>\n\nValidates the user has added the DNS TXT record required for validating ownership of the domain they are trying to set up a connector for.",
	...parameters,
	loader: () => import("./begin-verification.handler.js"),
});

export default command;
