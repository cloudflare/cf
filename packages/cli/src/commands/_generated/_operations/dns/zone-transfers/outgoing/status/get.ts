/** @generated from dns.zone-transfers.outgoing.status.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing/status`,
} as const;
