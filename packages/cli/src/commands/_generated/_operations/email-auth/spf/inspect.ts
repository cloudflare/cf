/** @generated from email-auth.spf.inspect */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/auth/spf/inspect`,
	query: ["id"],
} as const;
