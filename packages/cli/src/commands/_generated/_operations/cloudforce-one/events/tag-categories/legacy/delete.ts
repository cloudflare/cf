/** @generated from cloudforce-one.events.tag-categories.legacy.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/categories/{category_uuid}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
