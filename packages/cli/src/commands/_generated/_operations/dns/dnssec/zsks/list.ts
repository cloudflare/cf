/** @generated from dns.dnssec.zsks.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/dnssec/zsk`,
} as const;
