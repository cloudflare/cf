/** @generated from zones.transformations-c2pa.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_c2pa`,
	body: "json",
} as const;
