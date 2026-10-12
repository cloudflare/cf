/** @generated from dns-records-for-a-zone-export-dns-records */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/export`,
	response: "text",
} as const;
