/** @generated from api-security.schema-validation.settings.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings`,
	body: "json",
} as const;
