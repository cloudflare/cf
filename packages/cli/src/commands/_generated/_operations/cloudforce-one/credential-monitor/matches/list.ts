/** @generated from cloudforce-one.credential-monitor.matches.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/v2/credential-monitor/matches",
	query: ["domain", "username", "page", "per_page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
