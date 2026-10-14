/** @generated from dns.zone-transfers.incoming.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/incoming`,
} as const;
