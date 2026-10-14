/** @generated from dns.zone-transfers.incoming.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/incoming`,
	body: "json",
} as const;
