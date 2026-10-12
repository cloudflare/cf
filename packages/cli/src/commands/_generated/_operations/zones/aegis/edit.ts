/** @generated from zone-cache-settings-change-aegis-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/aegis`,
	body: "json",
} as const;
