/** @generated from cloudforce-one.events.dataset.copy.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/copy",
	query: ["keepRawData"],
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
