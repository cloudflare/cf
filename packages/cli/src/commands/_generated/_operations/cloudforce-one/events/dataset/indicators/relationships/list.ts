/** @generated from cloudforce-one.events.dataset.indicators.relationships.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/indicators/{indicator_id}/relationships",
	query: ["search", "expand", "cursor", "pageSize"],
	errors: {
		400: "BadRequestError",
	},
} as const;
