/** @generated from acm.total-tls.edit */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/acm/total_tls`,
	body: "json",
} as const;
