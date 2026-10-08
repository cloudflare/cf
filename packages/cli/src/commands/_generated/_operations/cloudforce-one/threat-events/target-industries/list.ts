/** @generated from cloudforce-one.threat-events.target-industries.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/targetIndustries",
	query: ["datasetIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
