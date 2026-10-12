/** @generated from r2-data-catalog.namespaces.tables.maintenance-configs.queue */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2-catalog/${request.bucket_name}/namespaces/${request.namespace}/tables/${request.table_name}/maintenance-configs/${request.configuration_type}/queue`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
