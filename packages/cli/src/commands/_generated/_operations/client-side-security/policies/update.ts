/** @generated from page-shield-update-policy */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/policies/${request.policy_id}`,
	body: "json",
} as const;
