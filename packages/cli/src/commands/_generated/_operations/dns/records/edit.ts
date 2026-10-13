/** @generated from dns.records.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/${request.dns_record_id}`,
	query: ["include_shadow_metadata"],
	body: "json",
} as const;
