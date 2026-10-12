/** @generated from page-shield-update-settings */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield`,
	body: "json",
} as const;
