/** @generated from zones.origin-max-http-version.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_max_http_version`,
	body: "json",
} as const;
