/** @generated from cache.origin-cloud-regions.supported-regions-v1 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/origin_cloud_regions/supported_regions`,
} as const;
