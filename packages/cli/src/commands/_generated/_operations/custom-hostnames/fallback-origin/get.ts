/** @generated from custom-hostname-fallback-origin-for-a-zone-get-fallback-origin-for-custom-hostnames */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/fallback_origin`,
} as const;
