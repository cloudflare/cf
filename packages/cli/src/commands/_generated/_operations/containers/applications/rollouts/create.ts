/** @generated from containers.applications.rollouts.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/containers/applications/{application_id}/rollouts",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
