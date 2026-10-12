/** @generated from zone-settings-change-h2-prioritization-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/h2_prioritization`,
	body: "json",
} as const;
