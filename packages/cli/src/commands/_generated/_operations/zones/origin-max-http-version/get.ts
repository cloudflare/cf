/** @generated from zone-cache-settings-get-origin-max-http-version-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_max_http_version`,
} as const;
