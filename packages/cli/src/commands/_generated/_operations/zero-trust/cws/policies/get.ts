/** @generated from zero-trust.cws.policies.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policies/${request.policy_id}`,
} as const;
