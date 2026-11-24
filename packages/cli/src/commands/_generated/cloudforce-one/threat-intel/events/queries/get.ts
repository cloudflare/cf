/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
		{ placeholder: "query-id", brief: "Event query ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <query-id>",
	describe: "Get a saved event query",
	usage:
		"$0 cloudforce-one threat-intel events queries get <query-id>\n\nReturns a saved event query by its ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
