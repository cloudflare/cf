/** @generated from argo.smart-routing.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/argo/smart_routing`,
} as const;
