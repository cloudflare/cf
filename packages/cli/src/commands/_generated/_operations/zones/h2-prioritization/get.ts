/** @generated from zones.h2-prioritization.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/h2_prioritization`,
} as const;
