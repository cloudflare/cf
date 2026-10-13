/** @generated from cache.origin-cloud-regions.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/${request.origin_ip}`,
	body: "json",
} as const;
