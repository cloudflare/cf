/** @generated from rulesets.versions.by-tag.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/${request.ruleset_id}/versions/${request.ruleset_version}/by_tag/${request.rule_tag}`,
} as const;
