/** @generated from dns.records.import */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/import`,
	pathParams: ["zone_id"],
	body: "form",
} as const;
