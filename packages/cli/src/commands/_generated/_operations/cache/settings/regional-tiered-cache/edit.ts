/** @generated from zone-cache-settings-change-regional-tiered-cache-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/regional_tiered_cache`,
	body: "json",
} as const;
