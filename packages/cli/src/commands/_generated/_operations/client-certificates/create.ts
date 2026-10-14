/** @generated from client-certificates.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/client_certificates`,
	body: "json",
} as const;
