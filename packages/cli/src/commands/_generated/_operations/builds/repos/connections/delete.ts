/** @generated from deleteRepoConnection */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/repos/connections/${request.repo_connection_uuid}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
