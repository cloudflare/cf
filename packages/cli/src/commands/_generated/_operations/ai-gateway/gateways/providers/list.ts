/** @generated from aig-config-list-providers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/provider_configs`,
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
