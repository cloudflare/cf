/** @generated from schema-validation-delete-schema */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas/${request.schema_id}`,
} as const;
