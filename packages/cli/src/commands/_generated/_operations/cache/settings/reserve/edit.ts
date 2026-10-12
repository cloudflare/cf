/** @generated from zone-cache-settings-change-cache-reserve-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/cache_reserve`,
	body: "json",
} as const;
