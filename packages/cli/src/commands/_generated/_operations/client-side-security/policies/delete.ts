/** @generated from page-shield-delete-policy */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/policies/${request.policy_id}`,
	response: false,
} as const;
