/** @generated from zero-trust.access.applications.policy-tests.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policy-tests/${request.policy_test_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
