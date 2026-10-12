/** @generated from access-policy-tests-get-an-update */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policy-tests/${request.policy_test_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
