/** @generated from ai-gateway.gateways.providers.test */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/provider_configs/${request.id}/test`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		501: "NotImplementedError",
	},
} as const;
