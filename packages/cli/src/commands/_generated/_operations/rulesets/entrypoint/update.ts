/** @generated from rulesets.entrypoint.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/phases/${request.ruleset_phase}/entrypoint`,
	query: ["dry_run"],
	body: "json",
} as const;
