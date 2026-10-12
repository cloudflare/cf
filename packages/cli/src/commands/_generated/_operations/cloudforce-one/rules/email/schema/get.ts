/** @generated from cloudforce-one-get-email-rule-schema */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/structured/schema`,
	errors: {
		400: "BadRequestError",
	},
} as const;
