/** @generated from rulesets.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/${request.ruleset_id}`,
	query: ["dry_run"],
	body: "json",
} as const;
