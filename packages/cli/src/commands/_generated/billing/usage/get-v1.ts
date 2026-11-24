/**
 * get-v1 command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Start date for the usage query (ISO 8601). The provided time range must include the subscription billing cycle anchor day, otherwise no usage data is returned. Use the info endpoint to retrieve the subscription anchor day.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End date for the usage query (ISO 8601).",
			optional: true,
			parse: String,
		},
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
	command: "get-v1",
	describe: "Get Account Billable Usage (Version 1, Alpha)",
	usage:
		"$0 billing usage get-v1\n\nReturns billable usage data for the account. When no query parameters are provided, returns usage for the current billing period.",
	...parameters,
	loader: () => import("./get-v1.handler.js"),
});

export default command;
