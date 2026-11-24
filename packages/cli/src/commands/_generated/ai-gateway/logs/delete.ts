/**
 * delete command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
				"cost",
				"tokens_in",
				"tokens_out",
				"duration",
				"feedback",
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
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "gateway-id",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <gateway-id>",
	describe: "Delete Gateway Logs",
	usage:
		"$0 ai-gateway logs delete <gateway-id>\n\nDeletes gateway log entries matching the specified criteria.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
