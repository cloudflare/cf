/** @generated from custom-hostnames.fallback-origin.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/fallback_origin`,
} as const;
