/** @generated from argo.smart-routing.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/argo/smart_routing`,
	body: "json",
} as const;
