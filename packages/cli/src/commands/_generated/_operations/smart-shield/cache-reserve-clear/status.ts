/** @generated from smart-shield-settings-get-cache-reserve-clear */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/cache_reserve_clear`,
} as const;
