/** @generated from cloudforce-one.threat-events.datasets.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset",
	query: ["includeDeleted"],
	errors: {
		400: "BadRequestError",
	},
} as const;
