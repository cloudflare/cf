/** @generated from basin-catalog.namespaces.tables.maintenance-configs.queue */
export default {
	method: "POST",
	path: "/accounts/{account_id}/basin-catalog/{bucket_name}/namespaces/{namespace}/tables/{table_name}/maintenance-configs/{configuration_type}/queue",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
