/** @generated from smart-shield.cache-reserve-clear.status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/cache_reserve_clear`,
} as const;
