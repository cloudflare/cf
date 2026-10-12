/** @generated from smart-tiered-cache-get-smart-tiered-cache-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/tiered_cache_smart_topology_enable`,
} as const;
