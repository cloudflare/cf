/** @generated from cloudforce-one.events.dataset.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
