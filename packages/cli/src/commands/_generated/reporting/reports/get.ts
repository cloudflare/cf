/**
 * get command
 * @generated from apis/overlays/reporting.ts
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
			placeholder: "report-id",
			brief: "Unique report identifier",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <report-id>",
	describe: "Get a generated report",
	usage:
		"$0 reporting reports get <report-id>\n\nGets a generated report by identifier.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
