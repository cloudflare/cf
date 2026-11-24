/**
 * url-info command
 * @generated from apis/overlays/brand-protection.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "url-info",
	describe: "Get total query count",
	usage:
		"$0 brand-protection url-info\n\nReturns the number of saved domain and logo queries in the account. This is the count checked against the account's Brand Protection query limit.",
	...parameters,
	loader: () => import("./url-info.handler.js"),
});

export default command;
