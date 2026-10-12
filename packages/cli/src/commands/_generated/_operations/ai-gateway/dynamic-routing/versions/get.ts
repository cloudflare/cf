/** @generated from aig-config-get-gateway-dynamic-route-version */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/routes/${request.id}/versions/${request.version_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
