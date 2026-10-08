/** @generated from cloudforce-one.events.dataset.indicator.types.create.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/indicatorTypes/create",
	body: "json",
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
