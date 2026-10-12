/** @generated from email-routing-settings-replace-email-routing-settings */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing`,
	body: "json",
	errors: {
		403: "ForbiddenError",
	},
} as const;
