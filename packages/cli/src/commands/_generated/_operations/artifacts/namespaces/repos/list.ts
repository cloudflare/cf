/** @generated from artifacts_repos_list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/artifacts/namespaces/${request.namespace}/repos`,
	query: ["limit", "cursor", "search", "sort", "direction"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
