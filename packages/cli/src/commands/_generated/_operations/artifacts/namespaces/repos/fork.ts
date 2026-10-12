/** @generated from artifacts_repos_fork */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/artifacts/namespaces/${request.namespace}/repos/${request.name}/fork`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
