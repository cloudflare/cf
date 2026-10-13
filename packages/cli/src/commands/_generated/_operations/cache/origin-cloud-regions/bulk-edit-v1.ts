/** @generated from cache.origin-cloud-regions.bulk-edit-v1 */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/origin_cloud_regions/batch`,
	body: "json",
} as const;
