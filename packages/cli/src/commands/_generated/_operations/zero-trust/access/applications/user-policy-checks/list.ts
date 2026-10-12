/** @generated from zero-trust.access.applications.user-policy-checks.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps/${request.app_id}/user_policy_checks`,
} as const;
