/** @generated from total-tls-total-tls-settings-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/acm/total_tls`,
} as const;
