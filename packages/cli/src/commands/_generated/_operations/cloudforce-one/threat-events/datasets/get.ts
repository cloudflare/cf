/** @generated from cloudforce-one.threat-events.datasets.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/dataset/{dataset_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
