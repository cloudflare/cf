/** @generated from builds.repos.connections.upsert */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/repos/connections`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
	},
} as const;
