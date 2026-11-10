/** @generated from builds.workers.purge-cache */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_tag}/purge_build_cache`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
