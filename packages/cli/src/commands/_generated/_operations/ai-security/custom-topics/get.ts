/** @generated from ai-security.custom-topics.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ai-security/custom-topics`,
} as const;
