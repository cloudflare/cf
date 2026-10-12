/** @generated from zone-settings-get-transformations-config */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_config`,
} as const;
