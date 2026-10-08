/** @generated from cloudforce-one.events.raw.legacy.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/raw/{dataset_id}/{event_id}",
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
