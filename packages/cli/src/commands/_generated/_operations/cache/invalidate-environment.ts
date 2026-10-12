/** @generated from cache.invalidate-environment */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/environments/${request.environment_id}/invalidate_cache`,
	body: "json",
} as const;
