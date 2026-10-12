/** @generated from aig-config-list-gateway-dynamic-route-versions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/routes/${request.id}/versions`,
	errors: {
		400: "BadRequestError",
	},
} as const;
