/** @generated from cloudforce-one.events.tags.relationships.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/{tag_uuid}/relationships",
	query: ["datasets", "search", "expand", "cursor", "pageSize"],
	errors: {
		400: "BadRequestError",
	},
} as const;
