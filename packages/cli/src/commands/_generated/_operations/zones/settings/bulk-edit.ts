/** @generated from zones.settings.bulk-edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings`,
	body: "json",
} as const;
