/** @generated from ai-gateway.dynamic-routing.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/routes`,
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
