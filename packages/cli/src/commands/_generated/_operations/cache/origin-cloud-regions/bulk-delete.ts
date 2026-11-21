/** @generated from cache.origin-cloud-regions.bulk-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/batch`,
	body: "json",
} as const;
