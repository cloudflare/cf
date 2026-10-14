/** @generated from cache.origin-cloud-regions.create-v1 */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/origin_cloud_regions`,
	body: "json",
} as const;
