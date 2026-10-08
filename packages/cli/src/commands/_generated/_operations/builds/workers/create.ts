/** @generated from builds.workers.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/builds/workers",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
