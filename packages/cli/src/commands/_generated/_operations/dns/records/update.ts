/** @generated from dns.records.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/${request.dns_record_id}`,
	query: ["include_shadow_metadata"],
	body: "json",
} as const;
