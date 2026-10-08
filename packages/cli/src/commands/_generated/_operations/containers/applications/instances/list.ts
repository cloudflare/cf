/** @generated from containers.applications.instances.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/containers/applications/{application_id}/instances-v2",
	query: ["per_page", "page_token", "state", "name_prefix"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
