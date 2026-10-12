/** @generated from zone-settings-get-transformations-c2pa-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_c2pa`,
} as const;
