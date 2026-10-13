/** @generated from cache.origin-cloud-regions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/${request.origin_ip}`,
} as const;
