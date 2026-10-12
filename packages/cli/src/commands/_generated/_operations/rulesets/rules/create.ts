/** @generated from rulesets.rules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/${request.ruleset_id}/rules`,
	query: ["dry_run"],
	body: "json",
} as const;
