/** @generated from access-policy-tests-get-a-user-page */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policy-tests/${request.policy_test_id}/users`,
	query: ["page", "per_page", "status"],
	errors: {
		400: "BadRequestError",
	},
} as const;
