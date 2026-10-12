/** @generated from origin-cloud-regions-v2-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions`,
	query: ["page", "per_page"],
} as const;
