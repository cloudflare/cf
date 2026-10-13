/** @generated from intel.sinkholes.ingresses.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/intel/sinkholes/${request.sinkhole_id}/ingresses/${request.ingress_id}`,
	body: "json",
} as const;
