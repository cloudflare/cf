/** @generated from rulesets.versions.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/${request.ruleset_id}/versions/${request.ruleset_version}`,
	query: ["dry_run"],
	response: false,
} as const;
