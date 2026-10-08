/** @generated from zero-trust.casb.content.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/content",
	query: [
		"direction",
		"dlp_profile_id",
		"integration_id",
		"max_affliction_date",
		"min_affliction_date",
		"order",
		"page",
		"per_page",
		"search",
		"vendor",
	],
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
	},
} as const;
