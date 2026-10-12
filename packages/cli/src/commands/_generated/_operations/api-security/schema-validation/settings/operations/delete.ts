/** @generated from schema-validation-delete-per-operation-setting */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings/operations/${request.operation_id}`,
} as const;
