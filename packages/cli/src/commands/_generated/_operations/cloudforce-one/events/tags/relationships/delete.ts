/** @generated from cloudforce-one.events.tags.relationships.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/{tag_uuid}/relationships/{rel_uuid}",
	query: ["datasetId"],
	errors: {
		400: "BadRequestError",
	},
} as const;
