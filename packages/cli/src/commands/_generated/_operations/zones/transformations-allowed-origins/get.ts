/** @generated from zone-settings-get-transformations-allowed-origins-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_allowed_origins`,
} as const;
