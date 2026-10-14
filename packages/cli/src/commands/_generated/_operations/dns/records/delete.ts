/** @generated from dns.records.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/${request.dns_record_id}`,
} as const;
