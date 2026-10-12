/** @generated from zones.rum.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/rum`,
	body: "json",
} as const;
