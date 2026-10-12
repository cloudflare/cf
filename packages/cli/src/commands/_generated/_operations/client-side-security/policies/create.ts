/** @generated from page-shield-create-policy */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/policies`,
	body: "json",
} as const;
