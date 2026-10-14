/** @generated from api-security.schema-validation.settings.operations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings/operations/${request.operation_id}`,
} as const;
