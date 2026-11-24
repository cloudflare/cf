/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <sso-connector-id>",
	describe: "Delete SSO connector",
	usage:
		"$0 iam sso delete <sso-connector-id>\n\nDeletes an SSO connector from the account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
