/** @generated from zone-settings-get-google-tag-gateway-config */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/google-tag-gateway/config`,
} as const;
