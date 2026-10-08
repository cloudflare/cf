/** @generated from cloudforce-one.priority-intelligence.interests.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/interests",
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
