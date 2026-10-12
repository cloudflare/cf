/** @generated from zero-trust-gateway-rules-reset-expiration-zero-trust-gateway-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules/${request.rule_id}/reset_expiration`,
} as const;
