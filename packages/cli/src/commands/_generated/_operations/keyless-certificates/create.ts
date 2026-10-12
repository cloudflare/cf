/** @generated from keyless-ssl-for-a-zone-create-keyless-ssl-configuration */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/keyless_certificates`,
	body: "json",
} as const;
