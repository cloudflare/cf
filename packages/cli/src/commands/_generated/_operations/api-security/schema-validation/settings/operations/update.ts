/** @generated from schema-validation-update-per-operation-setting */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings/operations/${request.operation_id}`,
	body: "json",
} as const;
