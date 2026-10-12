/** @generated from ssl.verification.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/verification`,
	query: ["retry"],
} as const;
