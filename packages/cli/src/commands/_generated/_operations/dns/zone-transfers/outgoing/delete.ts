/** @generated from secondary-dns-(-primary-zone)-delete-primary-zone-configuration */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing`,
} as const;
