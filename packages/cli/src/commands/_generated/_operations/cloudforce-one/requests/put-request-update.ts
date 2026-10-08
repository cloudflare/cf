/** @generated from cloudforce-one.requests.put-request-update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}/{request_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
