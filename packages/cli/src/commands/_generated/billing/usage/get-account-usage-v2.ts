/**
 * get-account-usage-v2 command
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
	command: "get-account-usage-v2",
	describe: "Get Account Usage (Version 2, Alpha, Restricted)",
	usage:
		"$0 billing usage get-account-usage-v2\n\nReturns cost and usage data for a single Cloudflare account, aligned with the [FinOps FOCUS v1.3](https://focus.finops.org/focus-specification/v1-3/) Cost and Usage dataset specification. Each record represents one billable metric for one account on one day. This includes all metered usage, including usage that falls within free-tier allowances and may result in zero cost. **Note:** This endpoint serves `usage` records only; cost and pricing fields are absent from responses. To retrieve rated costs, use `POST` on the same path with `Metric: cost`. When `from` and `to` are omitted, defaults to the start of the current month through today. The maximum date range is 31 days.",
	...parameters,
	loader: () => import("./get-account-usage-v2.handler.js"),
});

export default command;
