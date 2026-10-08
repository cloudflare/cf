/** @generated from cloudforce-one.requests.get-request-read */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}/{request_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
