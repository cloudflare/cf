/** @generated from dns.zone-transfers.outgoing.force-notify */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing/force_notify`,
} as const;
