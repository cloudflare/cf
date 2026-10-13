/** @generated from zero-trust.access.applications.policy-tests.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policy-tests`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
