/** @generated from zones-0-hold-patch */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/hold`,
	body: "json",
} as const;
