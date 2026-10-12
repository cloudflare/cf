/** @generated from delete-security-txt */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/security-center/securitytxt`,
} as const;
