/** @generated from custom-hostname-fallback-origin-for-a-zone-update-fallback-origin-for-custom-hostnames */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/fallback_origin`,
	body: "json",
} as const;
