/** @generated from custom-hostname-for-a-zone-list-custom-hostnames */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames`,
	query: [
		"hostname",
		"hostname.exact",
		"hostname.startsWith",
		"hostname.contain",
		"id",
		"page",
		"per_page",
		"order",
		"direction",
		"ssl_status",
		"hostname_status",
		"certificate_authority",
		"wildcard",
		"custom_origin_server",
		"ssl",
	],
} as const;
