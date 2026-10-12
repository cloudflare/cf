/** @generated from dns-records-for-a-zone-batch-dns-records */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/batch`,
	query: ["include_shadow_metadata"],
	body: "json",
} as const;
