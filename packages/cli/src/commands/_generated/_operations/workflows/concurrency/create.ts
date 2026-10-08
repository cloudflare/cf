/** @generated from workflows.concurrency.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workflows/concurrency",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
	},
} as const;
