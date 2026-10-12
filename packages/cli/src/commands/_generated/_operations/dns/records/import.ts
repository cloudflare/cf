/** @generated from dns-records-for-a-zone-import-dns-records */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/import`,
	pathParams: ["zone_id"],
	body: "form",
} as const;
