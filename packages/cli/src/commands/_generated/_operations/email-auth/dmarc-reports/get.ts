/** @generated from get_dmarc_reports_status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/auth/dmarc-reports`,
} as const;
