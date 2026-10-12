/** @generated from page-shield-get-cookie */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/cookies/${request.cookie_id}`,
} as const;
