/** @generated from ai-security.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ai-security/settings`,
	body: "json",
} as const;
