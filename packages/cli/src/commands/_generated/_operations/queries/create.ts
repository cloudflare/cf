/** @generated from queries.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/brand-protection/queries",
	query: ["id"],
	body: "json",
	response: false,
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
