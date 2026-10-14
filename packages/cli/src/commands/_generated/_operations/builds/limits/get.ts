/** @generated from builds.limits.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/account/limits`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
