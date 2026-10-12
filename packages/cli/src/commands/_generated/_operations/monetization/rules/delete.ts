/** @generated from monetization.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/monetization/rules/${request.rule_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
