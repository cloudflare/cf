/** @generated from smart-shield.cache-reserve-clear.clear */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/cache_reserve_clear`,
} as const;
