/** @generated from cache.settings.regional-tiered-cache.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/regional_tiered_cache`,
} as const;
