/** @generated from rulesets.entrypoint.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/phases/${request.ruleset_phase}/entrypoint`,
} as const;
