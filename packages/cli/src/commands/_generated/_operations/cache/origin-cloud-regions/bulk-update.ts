/** @generated from cache.origin-cloud-regions.bulk-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/batch`,
	body: "json",
} as const;
