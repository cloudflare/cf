/** @generated from signed-url.get */
export default {
	method: "GET",
	path: () => "/signed-url",
	response: false,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
