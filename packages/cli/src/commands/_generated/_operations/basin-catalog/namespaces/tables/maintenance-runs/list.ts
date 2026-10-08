/** @generated from basin-catalog.namespaces.tables.maintenance-runs.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/basin-catalog/{bucket_name}/namespaces/{namespace}/tables/{table_name}/maintenance-runs",
	query: ["page_size", "page_token"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
