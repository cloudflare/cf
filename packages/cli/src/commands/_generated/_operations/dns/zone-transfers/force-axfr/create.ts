/** @generated from secondary-dns-(-secondary-zone)-force-axfr */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/force_axfr`,
} as const;
