/** @generated from cloudforce-one.events.dataset.permissions.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/permissions/{grant_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
