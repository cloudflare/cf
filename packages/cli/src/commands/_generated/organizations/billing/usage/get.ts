/**
 * get command
 * @generated from apis/overlays/organizations.ts
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
	operands: [
		{
			placeholder: "organization-id",
			brief: "Identifies the Cloudflare organization.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <organization-id>",
	describe: "Get Organization Usage (Version 2, Alpha, Restricted)",
	usage:
		"$0 organizations billing usage get <organization-id>\n\nReturns cost and usage data for all accounts within an organization, aligned with the [FinOps FOCUS v1.3](https://focus.finops.org/focus-specification/v1-3/) Cost and Usage dataset specification. Each record represents one billable metric for one account on one day. This includes all metered usage, including usage that falls within free-tier allowances and may result in zero cost. The response includes usage for every account belonging to the specified organization. **Note:** This endpoint serves `usage` records only; cost and pricing fields are absent from responses. Rated costs are available per account via `POST /accounts/{account_id}/billable/usage` with `Metric: cost`. When `from` and `to` are omitted, defaults to the start of the current month through today. The maximum date range is 31 days. An organization with no accounts, or an organization ID that does not exist, returns a successful response with an empty result set rather than an error.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
