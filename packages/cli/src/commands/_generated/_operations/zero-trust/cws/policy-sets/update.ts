/** @generated from cws-update-policy-set */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policy-sets/${request.policy_set_id}`,
	body: "json",
} as const;
