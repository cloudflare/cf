/** @generated from zero-trust.gateway.rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules/${request.rule_id}`,
} as const;
