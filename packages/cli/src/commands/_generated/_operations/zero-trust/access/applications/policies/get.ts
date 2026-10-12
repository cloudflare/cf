/** @generated from zero-trust.access.applications.policies.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps/${request.app_id}/policies/${request.policy_id}`,
} as const;
