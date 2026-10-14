/** @generated from email-routing.settings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
