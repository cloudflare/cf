/** @generated from zone-cache-settings-change-origin-h2-max-streams-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_h2_max_streams`,
	body: "json",
} as const;
