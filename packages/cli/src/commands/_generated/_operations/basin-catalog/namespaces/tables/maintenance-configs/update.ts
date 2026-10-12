/** @generated from basin-update-table-maintenance-config */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/basin-catalog/${request.bucket_name}/namespaces/${request.namespace}/tables/${request.table_name}/maintenance-configs`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
