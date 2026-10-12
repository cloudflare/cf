/** @generated from ai-security.custom-topics.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ai-security/custom-topics`,
	body: "json",
} as const;
