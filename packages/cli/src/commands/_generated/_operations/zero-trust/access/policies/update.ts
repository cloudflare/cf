/** @generated from zero-trust.access.policies.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies/${request.policy_id}`,
	body: "json",
} as const;
