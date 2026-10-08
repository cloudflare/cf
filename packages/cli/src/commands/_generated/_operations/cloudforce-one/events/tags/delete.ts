/** @generated from cloudforce-one.events.tags.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/{tag_uuid}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
