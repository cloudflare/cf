/** @generated from cloudforce-one.events.dataset.indicators.relationships.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/indicators/{indicator_id}/relationships",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
