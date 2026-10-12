/** @generated from dns.records.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records`,
	query: ["include_shadow_metadata"],
	body: "json",
} as const;
