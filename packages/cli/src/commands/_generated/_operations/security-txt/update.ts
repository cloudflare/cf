/** @generated from security-txt.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/security-center/securitytxt`,
	body: "json",
} as const;
