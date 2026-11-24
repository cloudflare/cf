/**
 * update command
 * @generated from apis/overlays/security-insights.ts
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
			brief:
				"Whether the partner integration is enabled for the account.\nEnabling the integration for the first time also schedules an account scan for that partner.\nDisabling the integration will purge all partner integration-related data, including partner insights, shadow zones, and shadow hosts.",
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
			placeholder: "partner",
			brief: "The partner integration identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <partner>",
	describe: "Updates Partner Integration Settings",
	usage:
		"$0 security-insights partners settings update <partner>\n\nEnables or disables the selected partner integration for the account. Enabling the integration for the first time also schedules an account scan for that partner. Disabling the integration will purge all partner integration-related data, including partner insights, shadow zones, and shadow hosts.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
