/** @generated from zone-settings-change-fonts-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/fonts`,
	body: "json",
} as const;
