/** @generated from origin-cloud-regions-v2-batch-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/batch`,
	body: "json",
} as const;
