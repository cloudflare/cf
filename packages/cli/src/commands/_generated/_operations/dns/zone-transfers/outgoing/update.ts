/** @generated from dns.zone-transfers.outgoing.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing`,
	body: "json",
} as const;
