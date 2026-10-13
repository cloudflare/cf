/** @generated from api-security.schema-validation.schemas.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas/${request.schema_id}`,
	query: ["omit_source"],
} as const;
