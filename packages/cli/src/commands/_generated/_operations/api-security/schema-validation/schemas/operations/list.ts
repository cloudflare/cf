/** @generated from api-security.schema-validation.schemas.operations.list */
export default {
	method: "GET",
	path: "/zones/{zone_id}/schema_validation/schemas/{schema_id}/operations",
	query: [
		"feature",
		"host",
		"method",
		"endpoint",
		"page",
		"per_page",
		"operation_status",
	],
} as const;
