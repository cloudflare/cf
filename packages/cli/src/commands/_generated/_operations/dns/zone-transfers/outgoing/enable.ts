/** @generated from secondary-dns-(-primary-zone)-enable-outgoing-zone-transfers */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing/enable`,
} as const;
