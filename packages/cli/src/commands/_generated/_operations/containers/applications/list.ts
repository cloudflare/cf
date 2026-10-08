/** @generated from containers.applications.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/containers/applications",
	query: ["per_page", "page_token", "name", "image"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
