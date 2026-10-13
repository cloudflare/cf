/** @generated from dns.zone-transfers.outgoing.disable */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing/disable`,
} as const;
