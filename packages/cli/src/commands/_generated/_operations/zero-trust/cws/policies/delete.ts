/** @generated from cws-delete-policy */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policies/${request.policy_id}`,
} as const;
