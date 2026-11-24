/**
 * get-account command
 * @generated from apis/overlays/pay-per-use.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		since: {
			kind: "parsed",
			brief:
				"Requested inclusive beginning of the statistics range as an RFC3339 timestamp. Rounded down to the selected UTC interval.",
			parse: String,
		},
		until: {
			kind: "parsed",
			brief:
				"Requested exclusive end of the statistics range as an RFC3339 timestamp. Rounded down to the selected UTC interval. The requested duration from since cannot exceed 31 days.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Results per page.",
			optional: true,
			parse: Number,
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
	command: "get-account",
	describe: "Get pay-per-use usage statistics",
	usage:
		"$0 pay-per-use usage-stats get-account\n\nReturns reported usage and the full gross value across all Pay Per Use zones and the publisher of a publisher account or zone over an explicit UTC range of at most 31 days. Usage from every domain and snapshotted price is summed by buyer. Ranges up to and including 7 days use hourly data points; longer ranges use daily data points. Because source data is aggregated hourly, both requested bounds are rounded down to the selected UTC interval and the resolved bounds are returned in the response. The resolved range must contain at least one complete interval. Empty periods are omitted. Buyers and their data points are paginated, while totals cover every buyer in the range. Values are raw usage counts and USD microcents; total_price_usd_microcents is the full value before the publisher revenue share.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./get-account.handler.js"),
});

export default command;
