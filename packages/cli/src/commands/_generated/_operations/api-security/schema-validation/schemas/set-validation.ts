/** @generated from api-security.schema-validation.schemas.set-validation */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas/${request.schema_id}`,
	body: "json",
} as const;
