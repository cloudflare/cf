/** @generated from zero-trust.dex.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/rules/${request.rule_id}`,
} as const;
