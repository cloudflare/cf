/** @generated from queries.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/brand-protection/queries",
	query: ["id", "tag", "scan"],
	response: false,
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
