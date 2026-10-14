/** @generated from zones.origin-h2-max-streams.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_h2_max_streams`,
} as const;
