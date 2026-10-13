/** @generated from ai-gateway.dynamic-routing.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/routes/${request.id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
