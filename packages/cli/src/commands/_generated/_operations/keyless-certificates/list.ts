/** @generated from keyless-ssl-for-a-zone-list-keyless-ssl-configurations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/keyless_certificates`,
} as const;
