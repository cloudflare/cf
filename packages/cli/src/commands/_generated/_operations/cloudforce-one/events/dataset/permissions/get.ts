/** @generated from cloudforce-one.events.dataset.permissions.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}/permissions",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
