/** @generated from cloudforce-one.events.dataset.indicators.relationships.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/indicators/{indicator_id}/relationships/{rel_uuid}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
