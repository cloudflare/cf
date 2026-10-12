/** @generated from get-zones-zone_id-logpush-edge-jobs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logpush/edge/jobs`,
} as const;
