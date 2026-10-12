/** @generated from artifacts_repos_blob_get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/artifacts/namespaces/${request.namespace}/repos/${request.name}/blob/${request.hash}`,
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		413: "ContentTooLargeError",
		500: "InternalServerError",
	},
} as const;
