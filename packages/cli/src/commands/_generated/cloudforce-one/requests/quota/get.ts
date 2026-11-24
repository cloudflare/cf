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
		{ placeholder: "project-type", brief: "RFI project type", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <project-type>",
	describe: "Get request token quota",
	usage:
		"$0 cloudforce-one requests quota get <project-type>\n\nReturns the account's token quota for the current anniversary quarter: total granted, used, remaining, and the quarter/anniversary boundaries. Also returns the annual allocation, usage, and remaining tokens for the current anniversary year; quarterly remaining controls usage.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
