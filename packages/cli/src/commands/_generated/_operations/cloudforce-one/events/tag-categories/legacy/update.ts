/** @generated from cloudforce-one.events.tag-categories.legacy.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/categories/{category_uuid}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
