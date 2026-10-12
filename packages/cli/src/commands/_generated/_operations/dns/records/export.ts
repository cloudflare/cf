/** @generated from dns.records.export */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dns_records/export`,
	response: "text",
} as const;
