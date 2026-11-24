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
			placeholder: "job-id",
			brief: "Identifier of the bulk action job.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <job-id>",
	describe: "Get bulk action job details",
	usage:
		"$0 email-security bulk-actions get <job-id>\n\nReturns the status and details of a specific bulk action job.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
