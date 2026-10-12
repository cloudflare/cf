/** @generated from secondary-dns-(-secondary-zone)-update-secondary-zone-configuration */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/incoming`,
	body: "json",
} as const;
