/** @generated from cloudforce-one.events.relationships.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/by-id/{event_id}/relationships",
	query: [
		"direction",
		"maxDepth",
		"relationshipTypes",
		"indicatorTypeIds",
		"datasetId",
		"includeParent",
		"page",
		"pageSize",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
