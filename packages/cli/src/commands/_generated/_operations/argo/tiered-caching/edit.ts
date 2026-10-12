/** @generated from argo.tiered-caching.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/argo/tiered_caching`,
	body: "json",
} as const;
