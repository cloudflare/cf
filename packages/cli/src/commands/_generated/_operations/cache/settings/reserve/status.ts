/** @generated from cache.settings.reserve.status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/cache_reserve_clear`,
} as const;
