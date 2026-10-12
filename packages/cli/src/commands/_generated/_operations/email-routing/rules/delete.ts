/** @generated from email-routing-routing-rules-delete-routing-rule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/rules/${request.rule_identifier}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
