/** @generated from dns-records-for-a-zone-scan-dns-records */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/scan`,
} as const;
