/**
 * update command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "SSO Connector enabled state",
			optional: true,
		},
		"use-fedramp-language": {
			kind: "boolean",
			brief:
				"Controls the display of FedRAMP language to the user during SSO login",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
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
	command: "update <sso-connector-id>",
	describe: "Update SSO connector state",
	usage:
		"$0 iam sso update <sso-connector-id>\n\nUpdates the state or configuration of an SSO connector.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
