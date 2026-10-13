/** @generated from zero-trust.gateway.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules/${request.rule_id}`,
} as const;
