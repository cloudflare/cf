/** @generated from cloudforce-one.rules.email.validate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/structured/validate`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
