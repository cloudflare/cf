/** @generated from secondary-dns-(-primary-zone)-get-outgoing-zone-transfer-status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing/status`,
} as const;
