/** @generated from schema-validation-edit-settings */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings`,
	body: "json",
} as const;
