/** @generated from cloudforce-one.threat-events.search */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/events",
	query: ["forceRefresh", "format", "cache"],
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
