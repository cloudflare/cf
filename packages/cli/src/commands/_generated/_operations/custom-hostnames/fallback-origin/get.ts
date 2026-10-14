/** @generated from custom-hostnames.fallback-origin.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/fallback_origin`,
} as const;
