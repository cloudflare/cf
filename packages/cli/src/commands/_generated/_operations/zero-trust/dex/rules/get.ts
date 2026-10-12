/** @generated from zero-trust.dex.rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/rules/${request.rule_id}`,
} as const;
