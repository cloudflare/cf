/** @generated from cloudforce-one.rules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
