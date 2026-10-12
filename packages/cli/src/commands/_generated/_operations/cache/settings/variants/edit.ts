/** @generated from zone-cache-settings-change-variants-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/variants`,
	body: "json",
} as const;
