/** @generated from secondary-dns-(-secondary-zone)-delete-secondary-zone-configuration */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/incoming`,
} as const;
