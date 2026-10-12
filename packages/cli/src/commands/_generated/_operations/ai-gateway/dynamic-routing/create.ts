/** @generated from aig-config-post-gateway-dynamic-route */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/routes`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
