/** @generated from zones.transformations-config.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_config`,
	body: "json",
} as const;
