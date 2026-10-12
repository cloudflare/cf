/** @generated from analyze-certificate-analyze-certificate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/analyze`,
	body: "json",
} as const;
