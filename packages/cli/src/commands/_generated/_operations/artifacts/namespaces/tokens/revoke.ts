/** @generated from artifacts.namespaces.tokens.revoke */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/artifacts/namespaces/${request.namespace}/tokens/${request.id}`,
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
