/** @generated from internal.submit.create */
export default {
	method: "POST",
	path: () => "/internal/submit",
	response: false,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
