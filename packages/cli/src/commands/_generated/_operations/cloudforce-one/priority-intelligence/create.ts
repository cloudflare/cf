/** @generated from cloudforce-one.priority-intelligence.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/priority-intelligence",
	body: "json",
	response: false,
	errors: {
		403: "ForbiddenError",
		429: "TooManyRequestsError",
	},
} as const;
