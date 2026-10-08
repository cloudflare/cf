/** @generated from builds.repos.config-autofill.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/repos/{provider_type}/{provider_account_id}/{repo_id}/config_autofill",
	query: ["branch", "root_directory"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
