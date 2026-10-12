/** @generated from cws-get-policy */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policies/${request.policy_id}`,
} as const;
