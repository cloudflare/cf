/** @generated from origin-cloud-regions-v2-supported-regions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/origin/cloud_regions/supported_regions`,
} as const;
