/** @generated from cloudforce-one.events.tags.patch */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/{tag_uuid}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
