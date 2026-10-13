/** @generated from acm.total-tls.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/acm/total_tls`,
} as const;
