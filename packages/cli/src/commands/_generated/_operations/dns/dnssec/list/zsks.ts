/** @generated from dns.dnssec.list.zsks */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dnssec/zsk`,
} as const;
