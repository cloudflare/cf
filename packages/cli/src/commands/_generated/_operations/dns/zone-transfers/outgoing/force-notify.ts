/** @generated from secondary-dns-(-primary-zone)-force-dns-notify */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/secondary_dns/outgoing/force_notify`,
} as const;
