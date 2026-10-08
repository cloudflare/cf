/** @generated from logos.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/brand-protection/logos",
	query: ["tag", "match_type", "threshold"],
	body: "json",
	contentType: "application/x-www-form-urlencoded",
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
