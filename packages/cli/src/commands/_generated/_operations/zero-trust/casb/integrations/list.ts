/** @generated from zero-trust.casb.integrations.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/one/integrations",
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
