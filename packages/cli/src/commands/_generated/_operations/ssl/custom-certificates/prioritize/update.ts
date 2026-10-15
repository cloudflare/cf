/** @generated from ssl.custom-certificates.prioritize.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_certificates/prioritize`,
	body: "json",
} as const;
