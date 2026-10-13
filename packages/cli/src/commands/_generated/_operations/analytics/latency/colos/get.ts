/** @generated from analytics.latency.colos.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/analytics/latency/colos`,
} as const;
