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
		submission: {
			kind: "boolean",
			brief:
				"When true, search the submissions datastore only. When false or omitted, search the\nregular datastore only.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "investigate-id",
			brief: "Unique identifier for a message retrieved from investigation.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <investigate-id>",
	describe: "Get message details",
	usage:
		"$0 email-security investigate get <investigate-id>\n\nRetrieves comprehensive details for a specific email message including headers, recipients, sender information, and current quarantine status. Use the investigate_id from search results to fetch detailed information.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
