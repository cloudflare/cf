/** @generated from containers.applications.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/containers/applications/{application_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
