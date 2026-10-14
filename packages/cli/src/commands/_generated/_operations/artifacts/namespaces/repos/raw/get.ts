/** @generated from artifacts.namespaces.repos.raw.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/artifacts/namespaces/${request.namespace}/repos/${request.name}/raw/${request.ref}/${request.path}`,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		413: "ContentTooLargeError",
		500: "InternalServerError",
	},
} as const;
