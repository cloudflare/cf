/** @generated from smart-tiered-cache-delete-smart-tiered-cache-setting */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/tiered_cache_smart_topology_enable`,
} as const;
