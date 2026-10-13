/** @generated from security-txt.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/security-center/securitytxt`,
} as const;
