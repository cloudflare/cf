/** @generated from monetization.rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/monetization/rules/${request.rule_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
