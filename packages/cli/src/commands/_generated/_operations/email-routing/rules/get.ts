/** @generated from email-routing.rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/rules/${request.rule_identifier}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
