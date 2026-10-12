/** @generated from zones.aegis.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/aegis`,
	body: "json",
} as const;
