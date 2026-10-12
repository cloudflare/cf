/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}/versions/{ruleset_version}/by_tag/{rule_tag} */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/${request.ruleset_id}/versions/${request.ruleset_version}/by_tag/${request.rule_tag}`,
} as const;
