/** @generated from cache.settings.reserve.clear */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/cache_reserve_clear`,
} as const;
