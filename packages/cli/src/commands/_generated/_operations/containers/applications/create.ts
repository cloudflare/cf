/** @generated from containers.applications.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/containers/applications",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
