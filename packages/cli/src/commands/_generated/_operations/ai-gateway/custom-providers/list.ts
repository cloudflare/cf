/** @generated from ai-gateway.custom-providers.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-gateway/custom-providers`,
	query: ["page", "per_page", "beta", "enable", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
