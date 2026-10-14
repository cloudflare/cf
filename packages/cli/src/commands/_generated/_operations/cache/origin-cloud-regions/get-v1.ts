/** @generated from cache.origin-cloud-regions.get-v1 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/origin_cloud_regions/${request.origin_ip}`,
} as const;
