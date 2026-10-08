/** @generated from cloudforce-one.events.tags.categories.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/tag-categories/{category_uuid}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
