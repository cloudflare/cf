/** @generated from schema-validation-get-schema */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas/${request.schema_id}`,
	query: ["omit_source"],
} as const;
