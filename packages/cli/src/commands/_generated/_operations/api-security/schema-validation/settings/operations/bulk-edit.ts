/** @generated from schema-validation-bulk-edit-per-operation-settings */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings/operations`,
	body: "json",
} as const;
