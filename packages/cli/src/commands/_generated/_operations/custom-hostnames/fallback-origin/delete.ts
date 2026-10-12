/** @generated from custom-hostname-fallback-origin-for-a-zone-delete-fallback-origin-for-custom-hostnames */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/fallback_origin`,
} as const;
