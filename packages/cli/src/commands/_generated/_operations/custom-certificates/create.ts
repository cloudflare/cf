/** @generated from custom-ssl-for-a-zone-create-ssl-configuration */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates`,
	body: "json",
} as const;
