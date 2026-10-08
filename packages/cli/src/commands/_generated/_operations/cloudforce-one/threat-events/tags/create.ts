/** @generated from cloudforce-one.threat-events.tags.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events/tags/create",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
