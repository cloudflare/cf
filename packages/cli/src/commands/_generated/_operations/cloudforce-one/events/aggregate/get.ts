/** @generated from cloudforce-one.events.aggregate.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/aggregate",
	query: [
		"aggregateBy",
		"datasetId",
		"startDate",
		"endDate",
		"groupByDate",
		"limit",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
