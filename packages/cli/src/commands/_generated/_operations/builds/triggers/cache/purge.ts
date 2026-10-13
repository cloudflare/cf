/** @generated from builds.triggers.cache.purge */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/triggers/${request.trigger_uuid}/purge_build_cache`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
