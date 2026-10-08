/** @generated from cloudforce-one.threat-events.attackers.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/events/attackers",
	query: ["datasetIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;
