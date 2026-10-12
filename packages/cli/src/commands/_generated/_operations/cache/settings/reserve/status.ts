/** @generated from zone-cache-settings-get-cache-reserve-clear */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/cache_reserve_clear`,
} as const;
