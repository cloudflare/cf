/** @generated from images.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/images/v2",
	query: [
		"continuation_token",
		"per_page",
		"sort_order",
		"creator",
		"meta.<field>[<operator>]",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
