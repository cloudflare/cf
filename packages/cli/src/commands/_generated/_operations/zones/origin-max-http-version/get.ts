/** @generated from zones.origin-max-http-version.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_max_http_version`,
} as const;
