/** @generated from schema-validation-get-per-operation-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/settings/operations/${request.operation_id}`,
} as const;
