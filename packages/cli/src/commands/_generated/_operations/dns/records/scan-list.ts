/** @generated from dns.records.scan-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/scan/review`,
} as const;
