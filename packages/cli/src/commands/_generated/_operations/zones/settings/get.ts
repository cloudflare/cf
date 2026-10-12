/** @generated from zone-settings-get-single-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/${request.setting_id}`,
} as const;
