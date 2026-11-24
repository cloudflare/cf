import operation from "../../_operations/ai-gateway/logs/list.js";
/**
 * list command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Gateway Logs",
	usage:
		"$0 ai-gateway logs list\n\nLists request/response log entries for the AI gateway with filtering and pagination.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway logs list",
				classification: {
					safeFlags: [
						"order-by",
						"order-by-direction",
						"meta-info",
						"direction",
						"feedback",
						"success",
						"cached",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					search: argv["search"],
					page: argv["page"],
					per_page: argv["per-page"],
					order_by: argv["order-by"],
					order_by_direction: argv["order-by-direction"],
					filters: argv["filters"],
					meta_info: argv["meta-info"],
					direction: argv["direction"],
					start_date: argv["start-date"],
					end_date: argv["end-date"],
					min_cost: argv["min-cost"],
					max_cost: argv["max-cost"],
					min_tokens_in: argv["min-tokens-in"],
					max_tokens_in: argv["max-tokens-in"],
					min_tokens_out: argv["min-tokens-out"],
					max_tokens_out: argv["max-tokens-out"],
					min_total_tokens: argv["min-total-tokens"],
					max_total_tokens: argv["max-total-tokens"],
					min_duration: argv["min-duration"],
					max_duration: argv["max-duration"],
					feedback: argv["feedback"],
					success: argv["success"],
					cached: argv["cached"],
					model: argv["model"],
					model_type: argv["model-type"],
					provider: argv["ai-gateway-provider"],
					request_content_type: argv["request-content-type"],
					response_content_type: argv["response-content-type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway logs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/logs`,
						pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
