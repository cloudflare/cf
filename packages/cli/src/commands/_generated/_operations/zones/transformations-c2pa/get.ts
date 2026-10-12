/** @generated from zones.transformations-c2pa.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/transformations_c2pa`,
} as const;
