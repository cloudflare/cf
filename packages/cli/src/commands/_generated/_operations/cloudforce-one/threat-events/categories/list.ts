/** @generated from cloudforce-one.threat-events.categories.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/categories",
	query: ["datasetIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
