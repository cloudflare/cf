/** @generated from api-security.schema-validation.schemas.hosts.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas/hosts`,
	query: ["page", "per_page"],
} as const;
