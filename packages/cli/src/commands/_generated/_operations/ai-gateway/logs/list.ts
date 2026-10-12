/** @generated from aig-config-list-gateway-logs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/logs`,
	query: [
		"search",
		"page",
		"per_page",
		"order_by",
		"order_by_direction",
		"filters",
		"meta_info",
		"direction",
		"start_date",
		"end_date",
		"min_cost",
		"max_cost",
		"min_tokens_in",
		"max_tokens_in",
		"min_tokens_out",
		"max_tokens_out",
		"min_total_tokens",
		"max_total_tokens",
		"min_duration",
		"max_duration",
		"feedback",
		"success",
		"cached",
		"model",
		"model_type",
		"provider",
		"request_content_type",
		"response_content_type",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
