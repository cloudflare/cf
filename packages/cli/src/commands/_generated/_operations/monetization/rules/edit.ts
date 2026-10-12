/** @generated from monetization-patch-rule */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/monetization/rules/${request.rule_id}`,
	body: "json",
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
