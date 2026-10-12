/** @generated from universal-ssl-settings-for-a-zone-universal-ssl-settings-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/universal/settings`,
} as const;
