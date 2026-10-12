/** @generated from sql-api-query-post */
export default {
	method: "POST",
	path: () => "/analytics/sql",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		501: "NotImplementedError",
		503: "ServiceUnavailableError",
		507: "InsufficientStorageError",
	},
} as const;
