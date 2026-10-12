/** @generated from dns.zone-transfers.incoming.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/incoming`,
	body: "json",
} as const;
