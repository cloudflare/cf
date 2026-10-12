/** @generated from schema-validation-create-schema */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/schema_validation/schemas`,
	body: "json",
	constants: {
		kind: "openapi_v3",
	},
} as const;
