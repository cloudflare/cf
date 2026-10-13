/** @generated from ai-gateway.datasets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/datasets`,
	query: ["page", "per_page", "name", "enable", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
