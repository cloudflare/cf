/** @generated from builds.cancel */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/builds/${request.build_uuid}/cancel`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
