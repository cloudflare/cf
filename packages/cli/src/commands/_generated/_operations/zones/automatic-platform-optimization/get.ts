/** @generated from zone-settings-get-automatic-platform-optimization-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/automatic_platform_optimization`,
} as const;
