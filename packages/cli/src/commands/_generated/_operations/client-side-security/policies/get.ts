/** @generated from client-side-security.policies.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/policies/${request.policy_id}`,
} as const;
