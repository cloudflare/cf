/** @generated from email-auth.dmarc-reports.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/auth/dmarc-reports`,
} as const;
