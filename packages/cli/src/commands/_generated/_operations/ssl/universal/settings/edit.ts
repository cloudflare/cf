/** @generated from universal-ssl-settings-for-a-zone-edit-universal-ssl-settings */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/universal/settings`,
	body: "json",
} as const;
