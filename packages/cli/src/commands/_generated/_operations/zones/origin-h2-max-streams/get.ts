/** @generated from zone-cache-settings-get-origin-h2-max-streams-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_h2_max_streams`,
} as const;
