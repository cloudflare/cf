/** @generated from cloudforce-one.requests.messages.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}/{request_id}/messages/new",
	headers: ["Idempotency-Key"],
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
