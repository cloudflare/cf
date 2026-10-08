/** @generated from cloudforce-one.events.tags.categories.create.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/categories/create",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
