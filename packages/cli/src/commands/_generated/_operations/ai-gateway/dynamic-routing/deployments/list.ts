/** @generated from ai-gateway.dynamic-routing.deployments.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/routes/${request.id}/deployments`,
	errors: {
		400: "BadRequestError",
	},
} as const;
