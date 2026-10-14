/** @generated from zero-trust.cws.policy-sets.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policy-sets/${request.policy_set_id}`,
	body: "json",
} as const;
