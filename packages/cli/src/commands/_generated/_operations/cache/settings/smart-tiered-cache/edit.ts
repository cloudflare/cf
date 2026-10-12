/** @generated from smart-tiered-cache-patch-smart-tiered-cache-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/tiered_cache_smart_topology_enable`,
	body: "json",
} as const;
