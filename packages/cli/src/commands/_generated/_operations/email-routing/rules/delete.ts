/** @generated from email-routing.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/rules/${request.rule_identifier}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
