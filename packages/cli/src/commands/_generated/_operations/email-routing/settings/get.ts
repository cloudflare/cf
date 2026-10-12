/** @generated from email-routing-settings-get-email-routing-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
