/** @generated from r2-data-catalog.namespaces.tables.maintenance-runs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2-catalog/${request.bucket_name}/namespaces/${request.namespace}/tables/${request.table_name}/maintenance-runs`,
	query: ["page_size", "page_token"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
