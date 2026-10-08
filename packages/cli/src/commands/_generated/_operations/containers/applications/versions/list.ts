/** @generated from containers.applications.versions.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/containers/applications/{application_id}/versions",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
