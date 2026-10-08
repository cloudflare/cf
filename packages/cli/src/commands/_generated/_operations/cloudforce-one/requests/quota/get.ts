/** @generated from cloudforce-one.requests.quota.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}/quota",
	response: false,
	errors: {
		404: "NotFoundError",
		422: "UnprocessableEntityError",
	},
} as const;
