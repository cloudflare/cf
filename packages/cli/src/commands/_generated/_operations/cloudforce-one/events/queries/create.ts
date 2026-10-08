/** @generated from cloudforce-one.events.queries.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events/queries/{query_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
