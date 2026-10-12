/** @generated from rum.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/v2/${request.ruleset_id}/rule/${request.rule_id}`,
} as const;
