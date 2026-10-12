/** @generated from aig-config-list-custom-domain */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways/${request.gateway_id}/custom-domains`,
	query: ["page", "per_page", "status", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
