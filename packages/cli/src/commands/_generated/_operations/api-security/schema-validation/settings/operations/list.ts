/** @generated from schema-validation-list-per-operation-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings/operations`,
	query: ["page", "per_page"],
} as const;
