/** @generated from zones.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) => path`/zones/${request.zone_id}`,
	body: "json",
} as const;
