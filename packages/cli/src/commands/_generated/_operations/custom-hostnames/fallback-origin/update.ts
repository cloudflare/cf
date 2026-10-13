/** @generated from custom-hostnames.fallback-origin.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/fallback_origin`,
	body: "json",
} as const;
