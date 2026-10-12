/** @generated from zero-trust-gateway-rules-patch-zero-trust-gateway-rule */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules/${request.rule_id}`,
	body: "json",
} as const;
