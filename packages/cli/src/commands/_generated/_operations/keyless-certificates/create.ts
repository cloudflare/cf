/** @generated from keyless-certificates.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/keyless_certificates`,
	body: "json",
} as const;
