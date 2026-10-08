/** @generated from cloudforce-one.requests.post-request-create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}",
	body: "json",
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
