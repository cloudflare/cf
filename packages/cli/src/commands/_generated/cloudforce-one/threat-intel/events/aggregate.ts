/**
 * aggregate command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"aggregate-by": {
			kind: "parsed",
			brief:
				"Column(s) to aggregate by - single column or comma-separated list (e.g., 'attacker', 'targetIndustry', 'attacker,targetIndustry'). With `tags`, an event counts once for each of its tags, in the bucket counts and in `total`, and events without tags count as `Unknown`; `tags` is not supported for analytics datasets.",
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset UUIDs to filter by, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Scope values query at most 50 datasets. If not provided, uses the default dataset.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"start-date": {
			kind: "parsed",
			brief: "Start date for filtering (ISO 8601 format, e.g., '2024-01-01')",
			optional: true,
			parse: String,
		},
		"end-date": {
			kind: "parsed",
			brief: "End date for filtering (ISO 8601 format, e.g., '2024-12-31')",
			optional: true,
			parse: String,
		},
		"group-by-date": {
			kind: "boolean",
			brief: "Whether to group results by date (daily aggregation)",
			optional: true,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of results to return",
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
	command: "aggregate",
	describe: "Aggregate events",
	usage:
		"$0 cloudforce-one threat-intel events aggregate\n\nCounts events grouped by one or more columns, such as `attacker` or `targetIndustry`. Optionally filter by date range and group the counts by day.",
	...parameters,
	loader: () => import("./aggregate.handler.js"),
});

export default command;
