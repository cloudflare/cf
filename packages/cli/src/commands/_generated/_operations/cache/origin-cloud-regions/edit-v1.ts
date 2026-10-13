/** @generated from cache.origin-cloud-regions.edit-v1 */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/origin_cloud_regions`,
	body: "json",
} as const;
