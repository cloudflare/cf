/** @generated from cache.invalidate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/invalidate_cache`,
	body: "json",
} as const;
