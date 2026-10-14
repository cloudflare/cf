/** @generated from ai-gateway.gateways.providers.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/provider_configs/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
