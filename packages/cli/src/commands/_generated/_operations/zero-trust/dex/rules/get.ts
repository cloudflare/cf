/** @generated from get-dex-rule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/rules/${request.rule_id}`,
} as const;
