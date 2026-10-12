/** @generated from zone-cache-settings-get-cache-reserve-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/cache_reserve`,
} as const;
