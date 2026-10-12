/** @generated from ai-gateway.evaluations.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/evaluations`,
	query: ["page", "per_page", "name", "processed", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
