/** @generated from ai-gateway.dynamic-routing.deployments.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/routes/${request.id}/deployments`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
