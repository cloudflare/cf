/** @generated from list_integrations_v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/one/integrations`,
	query: [
		"application",
		"direction",
		"dlp_enabled",
		"order",
		"page",
		"page_size",
		"search",
		"status",
		"use_cases",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
