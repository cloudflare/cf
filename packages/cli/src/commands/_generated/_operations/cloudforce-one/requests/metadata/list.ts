/** @generated from cloudforce-one.requests.metadata.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}/metadata",
	query: ["request_type", "country"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
