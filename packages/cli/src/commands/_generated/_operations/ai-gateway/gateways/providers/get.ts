/** @generated from aig-config-fetch-providers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/provider_configs/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
