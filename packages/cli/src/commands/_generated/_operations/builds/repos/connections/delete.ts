/** @generated from builds.repos.connections.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/builds/repos/connections/{repo_connection_uuid}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
