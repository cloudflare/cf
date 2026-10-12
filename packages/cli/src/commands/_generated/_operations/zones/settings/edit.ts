/** @generated from zone-settings-edit-single-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/${request.setting_id}`,
	body: "json",
} as const;
