/** @generated from post-zones-zone_id-logpush-edge-jobs */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logpush/edge/jobs`,
	body: "json",
} as const;
