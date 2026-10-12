/** @generated from api-security.token-validation.rules.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/rules/${request.rule_id}`,
	body: "json",
} as const;
