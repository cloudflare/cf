/** @generated from workflows.concurrency.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/concurrency/{key_id}",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
