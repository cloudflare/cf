/** @generated from getBuildLogs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/builds/${request.build_uuid}/logs`,
	query: ["cursor"],
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
