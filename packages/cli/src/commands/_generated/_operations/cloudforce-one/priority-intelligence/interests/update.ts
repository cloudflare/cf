/** @generated from cloudforce-one.priority-intelligence.interests.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/interests/{interest_id}",
	body: "json",
	response: false,
	errors: {
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
