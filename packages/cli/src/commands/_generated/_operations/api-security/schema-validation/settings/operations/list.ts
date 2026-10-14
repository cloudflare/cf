/** @generated from api-security.schema-validation.settings.operations.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings/operations`,
	query: ["page", "per_page"],
} as const;
