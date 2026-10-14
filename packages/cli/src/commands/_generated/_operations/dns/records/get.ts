/** @generated from dns.records.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/${request.dns_record_id}`,
	query: ["include_shadow_metadata"],
} as const;
