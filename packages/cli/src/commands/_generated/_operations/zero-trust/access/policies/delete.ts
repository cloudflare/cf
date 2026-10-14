/** @generated from zero-trust.access.policies.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies/${request.policy_id}`,
} as const;
