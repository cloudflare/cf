/** @generated from api-security.token-validation.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/rules/${request.rule_id}`,
} as const;
