/** @generated from monetization-get-rule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/monetization/rules/${request.rule_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
