/** @generated from cloudforce-one.threat-events.datasets.raw */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/datasets/{dataset_id}/events/{event_id}/raw",
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
