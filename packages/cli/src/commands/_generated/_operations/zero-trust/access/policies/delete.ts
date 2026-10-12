/** @generated from access-policies-delete-an-access-reusable-policy */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies/${request.policy_id}`,
} as const;
