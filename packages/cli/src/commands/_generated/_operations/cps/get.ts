/** @generated from user-communication-preferences-get */
export default {
	method: "GET",
	path: () => "/user/communication_preferences",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
