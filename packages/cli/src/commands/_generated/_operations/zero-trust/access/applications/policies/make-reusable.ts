/** @generated from zero-trust.access.applications.policies.make-reusable */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/apps/${request.app_id}/policies/${request.policy_id}/make_reusable`,
} as const;
