/** @generated from containers.applications.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/containers/applications/{application_id}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
