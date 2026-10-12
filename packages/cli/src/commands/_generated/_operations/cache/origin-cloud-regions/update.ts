/** @generated from origin-cloud-regions-v2-upsert */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/${request.origin_ip}`,
	body: "json",
} as const;
