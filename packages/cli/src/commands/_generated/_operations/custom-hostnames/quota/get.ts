/** @generated from custom-hostname-for-a-zone-get-custom-hostname-quota */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/quota`,
} as const;
