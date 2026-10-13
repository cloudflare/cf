/** @generated from builds.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/builds/${request.build_uuid}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
