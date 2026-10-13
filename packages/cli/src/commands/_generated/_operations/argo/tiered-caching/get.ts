/** @generated from argo.tiered-caching.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/argo/tiered_caching`,
} as const;
