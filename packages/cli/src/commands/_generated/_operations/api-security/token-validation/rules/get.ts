/** @generated from token-validation-rules-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/rules/${request.rule_id}`,
} as const;
