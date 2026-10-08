/** @generated from workers.versions.profile */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/workers/{worker_id}/versions/{version_id}/profile",
	body: "json",
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
