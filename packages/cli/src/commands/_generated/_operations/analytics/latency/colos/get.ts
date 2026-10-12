/** @generated from argo-analytics-for-geolocation-argo-analytics-for-a-zone-at-different-po-ps */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/analytics/latency/colos`,
} as const;
