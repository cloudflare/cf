/** @generated from intel.sinkholes.ingresses.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/intel/sinkholes/${request.sinkhole_id}/ingresses`,
	body: "json",
} as const;
