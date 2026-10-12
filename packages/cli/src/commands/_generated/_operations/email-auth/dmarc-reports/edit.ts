/** @generated from configure_dmarc_reports */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/auth/dmarc-reports`,
	body: "json",
} as const;
