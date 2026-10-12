/** @generated from cws-get-policy-set */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policy-sets/${request.policy_set_id}`,
} as const;
