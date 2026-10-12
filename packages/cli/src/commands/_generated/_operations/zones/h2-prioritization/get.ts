/** @generated from zone-settings-get-h2-prioritization-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/h2_prioritization`,
} as const;
