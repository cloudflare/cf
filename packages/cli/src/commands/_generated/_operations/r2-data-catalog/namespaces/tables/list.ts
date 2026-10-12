/** @generated from r2-data-catalog.namespaces.tables.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2-catalog/${request.bucket_name}/namespaces/${request.namespace}/tables`,
	query: ["page_token", "page_size", "return_uuids", "return_details"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
