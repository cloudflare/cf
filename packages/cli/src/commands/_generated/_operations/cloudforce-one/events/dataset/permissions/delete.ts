/** @generated from cloudforce-one.events.dataset.permissions.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/permissions/{grant_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
