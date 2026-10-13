/** @generated from dns.records.batch */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/batch`,
	query: ["include_shadow_metadata"],
	body: "json",
} as const;
