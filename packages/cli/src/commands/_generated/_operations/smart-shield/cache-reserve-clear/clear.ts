/** @generated from smart-shield-settings-start-cache-reserve-clear */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/cache_reserve_clear`,
} as const;
