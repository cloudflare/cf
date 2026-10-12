/** @generated from sinkhole-config-delete-ingress */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/intel/sinkholes/${request.sinkhole_id}/ingresses/${request.ingress_id}`,
} as const;
