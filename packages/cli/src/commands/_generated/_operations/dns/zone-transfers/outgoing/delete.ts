/** @generated from dns.zone-transfers.outgoing.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing`,
} as const;
