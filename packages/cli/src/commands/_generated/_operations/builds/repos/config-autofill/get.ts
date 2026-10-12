/** @generated from builds.repos.config-autofill.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/repos/${request.provider_type}/${request.provider_account_id}/${request.repo_id}/config_autofill`,
	query: ["branch", "root_directory"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
