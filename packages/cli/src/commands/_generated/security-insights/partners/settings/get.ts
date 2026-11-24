/**
 * get command
 * @generated from apis/overlays/security-insights.ts
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
			placeholder: "partner",
			brief: "The partner integration identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <partner>",
	describe: "Retrieves Partner Integration Settings",
	usage:
		"$0 security-insights partners settings get <partner>\n\nReturns whether the account has enabled the selected partner integration and, if enabled, whether the account has been matched with the partner. An integration that has not been configured is returned as disabled.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
