/** @generated from zone-settings-change-transformations-allowed-origins-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_allowed_origins`,
	body: "json",
} as const;
