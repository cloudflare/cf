/** @generated from zones.holds.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/hold`,
	query: ["hold_after"],
} as const;
