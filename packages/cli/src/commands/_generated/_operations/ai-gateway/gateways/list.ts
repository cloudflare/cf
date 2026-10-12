/** @generated from aig-config-list-gateway */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/gateways`,
	query: ["page", "per_page", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
