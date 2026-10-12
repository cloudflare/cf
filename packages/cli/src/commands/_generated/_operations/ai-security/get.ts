/** @generated from ai-security-settings-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ai-security/settings`,
} as const;
