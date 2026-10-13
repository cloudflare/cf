/** @generated from rulesets.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/${request.ruleset_id}/rules/${request.rule_id}`,
	query: ["dry_run"],
} as const;
