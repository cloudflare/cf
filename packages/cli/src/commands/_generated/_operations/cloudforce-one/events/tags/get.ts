/** @generated from cloudforce-one.events.tags.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/tags",
	query: ["page", "pageSize", "search", "categoryUuid", "filters", "cache"],
	errors: {
		400: "BadRequestError",
	},
} as const;
