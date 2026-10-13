/** @generated from custom-certificates.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates`,
	body: "json",
} as const;
