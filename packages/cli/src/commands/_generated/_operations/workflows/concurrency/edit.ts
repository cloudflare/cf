/** @generated from workflows.concurrency.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/workflows/concurrency/{key_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
