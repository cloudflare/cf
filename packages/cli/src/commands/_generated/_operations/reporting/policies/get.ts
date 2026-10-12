/** @generated from reporting-policies-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/reporting/policies/${request.policy_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
