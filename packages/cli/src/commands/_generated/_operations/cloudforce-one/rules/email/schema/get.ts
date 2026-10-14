/** @generated from cloudforce-one.rules.email.schema.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/structured/schema`,
	errors: {
		400: "BadRequestError",
	},
} as const;
