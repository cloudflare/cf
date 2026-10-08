/** @generated from containers.applications.instances.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/containers/applications/{application_id}/instances/{instance_id}",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
