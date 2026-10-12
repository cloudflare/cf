/** @generated from zone-settings-change-transformations-c2pa-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_c2pa`,
	body: "json",
} as const;
