/**
 * timeseries command
 * @generated from apis/overlays/analytics.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		filters: {
			kind: "parsed",
			brief:
				'Filters to apply before aggregating results. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "op": string, "values": [(string | boolean | number)]}].',
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief:
				"The start of the query time range (inclusive). RFC3339 format with timezone is required (e.g. `2024-11-05T00:00:00Z`).",
			optional: true,
			parse: String,
		},
		"group-by": {
			kind: "parsed",
			brief:
				"Specifies the column names to group results by. Requires valid columns for the target dataset.",
			variadic: true,
			optional: true,
			parse: String,
		},
		stats: {
			kind: "parsed",
			brief:
				"Specifies the stat names to include in results. Requires valid stats for the target dataset (e.g. `attemptsTotal`, `bytesTotal`).",
			variadic: true,
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"Specifies the end of the query time range (exclusive). Requires RFC3339 format with timezone.",
			optional: true,
			parse: String,
		},
		resolution: {
			kind: "parsed",
			brief:
				"Time bucket size for grouping results. Controls the granularity of the returned time slots.\n",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "dataset",
			brief:
				"Dataset name to query. Examples: \`access-logins\`, \`gateway-http\`, \`gateway-dns\`, \`gateway-http\`, \`shadow-it\`.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "timeseries <dataset>",
	describe: "Query analytics timeseries",
	usage:
		"$0 analytics query timeseries <dataset>\n\nReturns time-bucketed analytics data for a dataset. Includes time slots, each containing the requested stats, group-by dimensions, and resolution-controlled bucket size (e.g. `hour`, `day`).",
	...parameters,
	loader: () => import("./timeseries.handler.js"),
});

export default command;
