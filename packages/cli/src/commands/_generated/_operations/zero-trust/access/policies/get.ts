/** @generated from zero-trust.access.policies.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies/${request.policy_id}`,
} as const;
