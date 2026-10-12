/** @generated from ssl-verification-ssl-verification-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/verification`,
	query: ["retry"],
} as const;
