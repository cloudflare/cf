/** @generated from origin-cloud-regions-v2-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/${request.origin_ip}`,
} as const;
