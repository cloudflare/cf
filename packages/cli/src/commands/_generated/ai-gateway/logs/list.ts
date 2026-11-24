/**
 * list command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"gateway-id": {
			kind: "parsed",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
		search: {
			kind: "parsed",
			brief: "Free-text search over log metadata.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				"Page number, from 1. A high page reads every page before it again. To read further back in a listing sorted by created_at, ask for page 1 again with a created_at lt filter set to the created_at of the last log returned. Logs in the same millisecond as that log can be left out: to include them, set the filter 1 ms later and drop the logs already returned.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		"order-by": {
			kind: "enum",
			brief: "Order by",
			values: [
				"created_at",
				"provider",
				"model",
				"model_type",
				"success",
				"cached",
			],
			optional: true,
		},
		"order-by-direction": {
			kind: "enum",
			brief: "Order by direction",
			values: ["asc", "desc"],
			optional: true,
		},
		filters: {
			kind: "parsed",
			brief: "Filters",
			variadic: true,
			optional: true,
			parse: String,
		},
		"meta-info": { kind: "boolean", brief: "Meta info", optional: true },
		direction: {
			kind: "enum",
			brief: "Direction",
			values: ["asc", "desc"],
			optional: true,
		},
		"start-date": {
			kind: "parsed",
			brief: "Start date",
			optional: true,
			parse: String,
		},
		"end-date": {
			kind: "parsed",
			brief: "End date",
			optional: true,
			parse: String,
		},
		"min-cost": {
			kind: "parsed",
			brief: "Min cost",
			optional: true,
			parse: Number,
		},
		"max-cost": {
			kind: "parsed",
			brief: "Max cost",
			optional: true,
			parse: Number,
		},
		"min-tokens-in": {
			kind: "parsed",
			brief: "Min tokens in",
			optional: true,
			parse: Number,
		},
		"max-tokens-in": {
			kind: "parsed",
			brief: "Max tokens in",
			optional: true,
			parse: Number,
		},
		"min-tokens-out": {
			kind: "parsed",
			brief: "Min tokens out",
			optional: true,
			parse: Number,
		},
		"max-tokens-out": {
			kind: "parsed",
			brief: "Max tokens out",
			optional: true,
			parse: Number,
		},
		"min-total-tokens": {
			kind: "parsed",
			brief: "Min total tokens",
			optional: true,
			parse: Number,
		},
		"max-total-tokens": {
			kind: "parsed",
			brief: "Max total tokens",
			optional: true,
			parse: Number,
		},
		"min-duration": {
			kind: "parsed",
			brief: "Min duration",
			optional: true,
			parse: Number,
		},
		"max-duration": {
			kind: "parsed",
			brief: "Max duration",
			optional: true,
			parse: Number,
		},
		feedback: {
			kind: "enum",
			brief: "Feedback",
			values: ["-1", "0", "1"],
			optional: true,
		},
		success: { kind: "boolean", brief: "Success", optional: true },
		cached: { kind: "boolean", brief: "Cached", optional: true },
		model: {
			kind: "parsed",
			brief: "Model filter.",
			optional: true,
			parse: String,
		},
		"model-type": {
			kind: "parsed",
			brief: "Model type",
			optional: true,
			parse: String,
		},
		"ai-gateway-provider": {
			kind: "parsed",
			brief: "Provider",
			optional: true,
			parse: String,
		},
		"request-content-type": {
			kind: "parsed",
			brief: "Request content type",
			optional: true,
			parse: String,
		},
		"response-content-type": {
			kind: "parsed",
			brief: "Response content type",
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
	command: "list",
	describe: "List Gateway Logs",
	usage:
		"$0 ai-gateway logs list\n\nLists request/response log entries for the AI gateway with filtering and pagination.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
