/** @generated from containers.images.prepare */
export default {
	method: "POST",
	path: "/accounts/{account_id}/containers/image-preparations",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
