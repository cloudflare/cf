/** @generated from access-policy-tests */
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
