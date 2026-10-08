/** @generated from matches.download.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/brand-protection/matches/download",
	query: ["id", "offset", "limit", "include_domain_id", "include_dismissed"],
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
