/** @generated from dns.zone-transfers.outgoing.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing`,
	body: "json",
} as const;
