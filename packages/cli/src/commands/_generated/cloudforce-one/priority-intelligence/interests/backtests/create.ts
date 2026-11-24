/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"as-of": {
			kind: "parsed",
			brief: "The as_of field",
			optional: true,
			parse: String,
		},
		"backtest-days": {
			kind: "parsed",
			brief: "The backtest_days field",
			default: "30",
			parse: Number,
		},
		"candidate-limit": {
			kind: "parsed",
			brief: "The candidate_limit field",
			optional: true,
			parse: Number,
		},
		"dataset-ids": {
			kind: "parsed",
			brief: "The dataset_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"emerging-min-current-count": {
			kind: "parsed",
			brief: "The emerging_min_current_count field",
			optional: true,
			parse: Number,
		},
		"established-min-absolute-delta": {
			kind: "parsed",
			brief: "The established_min_absolute_delta field",
			optional: true,
			parse: Number,
		},
		"established-min-prior-count": {
			kind: "parsed",
			brief: "The established_min_prior_count field",
			optional: true,
			parse: Number,
		},
		"established-min-relative-delta": {
			kind: "parsed",
			brief: "The established_min_relative_delta field",
			optional: true,
			parse: Number,
		},
		"window-days": {
			kind: "parsed",
			brief: "The window_days field",
			default: "7",
			parse: Number,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Backtest account-interest change detection",
	usage:
		"$0 cloudforce-one priority-intelligence interests backtests create\n\nUses bounded full-span top-N candidates and daily event-date buckets. Results are conservative rather than an exact historical replay.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
