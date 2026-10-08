/** @generated from cloudforce-one.events.dataset.move.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/move",
	query: ["keepRawData"],
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
