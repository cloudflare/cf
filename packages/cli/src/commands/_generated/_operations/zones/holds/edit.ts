/** @generated from zones.holds.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/hold`,
	body: "json",
} as const;
