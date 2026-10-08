/** @generated from cloudforce-one.threat-events.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events",
	query: [
		"cursor",
		"search",
		"searchBranches",
		"page",
		"pageSize",
		"orderBy",
		"order",
		"datasetId",
		"forceRefresh",
		"format",
		"cache",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
