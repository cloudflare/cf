/** @generated from cloudforce-one.events.dataset.indicators.tags.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/indicators/tags",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
