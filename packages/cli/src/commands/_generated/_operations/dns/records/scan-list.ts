/** @generated from dns-records-for-a-zone-review-dns-scan */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/scan/review`,
} as const;
