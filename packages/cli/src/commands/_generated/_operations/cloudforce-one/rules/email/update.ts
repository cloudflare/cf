/** @generated from cloudforce-one.rules.email.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/structured/${request.id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
