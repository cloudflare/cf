/** @generated from schema-validation-list-schemas-paginated */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas`,
	query: ["page", "per_page", "omit_source", "validation_enabled"],
} as const;
