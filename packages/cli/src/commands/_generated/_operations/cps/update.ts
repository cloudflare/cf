/** @generated from user-communication-preferences-update */
export default {
	method: "PUT",
	path: () => "/user/communication_preferences",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
