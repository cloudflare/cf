/**
 * get-account-billable-metrics command
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
				"Start date for the usage query (ISO 8601). Required if `to` is set. When omitted along with `to`, defaults to the start of the current month. Filters by charge period (when consumption happened), not billing period. The maximum date range is 31 days.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"End date for the usage query (ISO 8601). Required if `from` is set. When omitted along with `from`, defaults to today. Filters by charge period (when consumption happened), not billing period. The maximum date range is 31 days.",
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
	command: "get-account-billable-metrics",
	describe: "List Account Billable Metrics (Version 2, Alpha, Restricted)",
	usage:
		"$0 billing usage get-account-billable-metrics\n\nLists billable metrics available to the account through contracts and subscriptions that overlap the requested period. Results are deduplicated and ordered. If no qualifying contract exists, the result is an empty array. When `from` and `to` are omitted, the period defaults to the start of the current month through today. The maximum date range is 31 days.",
	...parameters,
	loader: () => import("./get-account-billable-metrics.handler.js"),
});

export default command;
