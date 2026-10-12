/** @generated from schema-validation-extract-operations-from-schema */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas/${request.schema_id}/operations`,
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
