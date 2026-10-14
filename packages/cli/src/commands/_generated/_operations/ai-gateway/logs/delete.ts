/** @generated from ai-gateway.logs.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/logs`,
	query: ["order_by", "order_by_direction", "filters", "limit"],
	errors: {
		400: "BadRequestError",
	},
} as const;
