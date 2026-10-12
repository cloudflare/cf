/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id} */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/rulesets/${request.ruleset_id}`,
} as const;
