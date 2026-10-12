/** @generated from dns-records-for-a-zone-apply-dns-scan-results */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/scan/review`,
	body: "json",
} as const;
