/** @generated from custom-ssl-for-a-zone-re-prioritize-ssl-certificates */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates/prioritize`,
	body: "json",
} as const;
