/** @generated from token-validation-rules-bulk-edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/rules/bulk`,
	body: "json",
} as const;
