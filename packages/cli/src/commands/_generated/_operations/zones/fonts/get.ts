/** @generated from zone-settings-get-fonts-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/fonts`,
} as const;
