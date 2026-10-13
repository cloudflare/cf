/** @generated from ssl.universal.settings.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/universal/settings`,
	body: "json",
} as const;
