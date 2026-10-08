/** @generated from cloudforce-one.events.dataset.indicators.patch */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/indicators/{indicator_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
