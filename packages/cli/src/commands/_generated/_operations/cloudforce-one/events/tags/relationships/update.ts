/** @generated from cloudforce-one.events.tags.relationships.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/{tag_uuid}/relationships/{rel_uuid}",
	query: ["datasetId"],
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
