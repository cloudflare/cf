/** @generated from update-dex-rule */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/rules/${request.rule_id}`,
	body: "json",
} as const;
