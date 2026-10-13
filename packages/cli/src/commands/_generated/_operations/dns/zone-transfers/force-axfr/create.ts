/** @generated from dns.zone-transfers.force-axfr.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/force_axfr`,
} as const;
