/** @generated from cloudforce-one.rules.email.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/structured/${request.id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
