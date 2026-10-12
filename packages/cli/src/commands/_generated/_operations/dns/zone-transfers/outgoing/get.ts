/** @generated from secondary-dns-(-primary-zone)-primary-zone-configuration-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing`,
} as const;
