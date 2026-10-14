/** @generated from email-routing.rules.catch-all.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/rules/catch_all`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
